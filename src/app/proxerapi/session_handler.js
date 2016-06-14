const request = require('request-promise');
const cookieStore = require('tough-cookie-filestore');
const utils = require('../utils');
const pageUtils = require('./page_utils');
const Cloudscraper = require('../cloudscraper');
const os = require('os');
const { Cookie } = require('tough-cookie');
const IPCHandler = require('./ipc_handler');
const translate = require('../translation');

class SessionHandler extends IPCHandler {
    constructor(app, cookiePath, db) {
        super();
        this.app = app;
        this.cookiePath = cookiePath;
        this.db = db;
        this.cache = this.db.get('cache');
        this._online = true;
        this.translation = translate();

        this.provide('reload-request', ()  => {
            this.request = this.setupRequest();
        });

        this.provide('connectivity', (ev, state) => {
            this.online = state;
        });

        this.provide('clear-cache', (ev) => {
            this.clearCache();
            this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.INFO), this.translation.get(ERRORS.OTHER.CACHE_CLEAR));
        });
    }

    get online() {
        return this._online;
    }

    set online(value) {
        const changed = this._online != value;
        this._online = value;
        if(changed) {
            if(!value) {
                this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.SEVERE), this.translation.get(ERRORS.CONNECTION.NO_NETWORK));
            } else {
                this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.INFO), this.translation.get(ERRORS.CONNECTION.NETWORK_RECONNECT));
            }
        }
    }

    loadState() {
        return utils.createIfNotExists(this.cookiePath).then(() => {
            this.cookieJar = request.jar(new cookieStore(this.cookiePath));
            LOG.verbose('Loaded cookies from ' + this.cookiePath);
            this.request = this.setupRequest();
            this.cloudscraper = new Cloudscraper(this.request);
        }).return(this);
    }

    setupRequest() {
        const disableUserAgent = this.app.getSettings().getGeneralSettings().disable_user_agent;
        const header = pageUtils.getHeaders(this.app.info.version, disableUserAgent, os.platform(), os.release());

        LOG.verbose('Settings useragent to: ' + header['User-Agent']);
        return request.defaults({
            jar: this.cookieJar,
            headers: header,
            resolveWithFullResponse: true
        });
    }

    openRequest(doRequest) {
        const createRequest = () => {
            let promise;
            if(typeof(doRequest) == 'string') {
                LOG.silly('Doing request for url ' + doRequest);
                promise = this.request(doRequest);
            } else {
                LOG.silly('Creating custom request');
                promise = Promise.resolve(this.request).then(doRequest);
            }
            return promise;
        };

        return createRequest().then((response) => {
            const body = response.body;
            if(body.includes("Bitte aktualisiere die Seite")) {
                LOG.verbose("Proxer requested page reload.");
                return createRequest();
            } else if(body.includes("Retry for a live version")) {
                throw new Error("Offline");
            }

            return response;
        }).then(this.cacheResponse.bind(this)).catch((error) => {
            return this.handleError(error, doRequest);
        });
    }

    cacheResponse(response) {
        const url = response.request.path;
        const body = response.body;
        this.online = true;
        if(this.cache.find({ url: url })) {
            this.cache.chain().find({ url: url }).merge({ body: body }).value();
        } else {
            this.cache.push({ url: url, body: body }).value();
        }

        return body;
    }

    handleError(error, doRequest) {
        if(error.statusCode == 303) { // Just rethrow to let login handle it.
            LOG.debug('Received 303 error, rethrowing for login handler.');
            throw error;
        }

        LOG.warn("Error when requesting " + error.options.uri);
        if(error.statusCode == 525) {
            LOG.error('Received error 525 on request');
            this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.PROXER.OFFLINE));
        } else if(error.statusCode == 500) {
            LOG.error('Received 500 error, probably MySQL down');
            this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.PROXER.MYSQL_DOWN));
        } else if(error.statusCode == 503) {
            LOG.error('Received 503 error, attempting cloudlfare circumvention');
            this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.PROXER.CLOUDFLARE));
            return this.cloudscraper.handle(error.response, error.response.body).then(() => this.openRequest(doRequest)).catch((error) => {
                if(error.statusCode == 302) {
                    return this.openRequest(doRequest);
                } else {
                    throw error;
                }
            });
        } else if(/getaddr/.test(error.message)) {
            LOG.error('Other error but contained "getaddr" so it\'s probably no network:');
            LOG.error(error.message);
            if(this.online) {
                this.online = false;
            }
        } else {
            LOG.error('Unknown error occurred: ' + error.message);
            this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.SEVERE), this.translation.get(ERRORS.OTHER.UNKNOWN));
        }

        LOG.verbose("Trying response cache");
        let realUri = error.options.uri;
        realUri = realUri.substring(realUri.indexOf('/', 9));

        let cached = this.getCachedResponse(realUri);
        if(cached) {
            return cached.body;
        } else {
            LOG.error('No cached version found for uri ' + realUri);
            this.app.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.SEVERE), this.translation.get(ERRORS.CONNECTION.NO_CACHE));
            return "";
        }
    }
    getCachedResponse(url) {
        LOG.info("Return cached reponse for request to " + url);
        return this.cache.find({ url: url });
    }

    clearCache() {
        LOG.info('Clearing response cache...');
        this.cache.remove();
    }
}
module.exports = SessionHandler;
