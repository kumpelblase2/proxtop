const request = require('request-promise');
const cookieStore = require('./filestore');
const utils = require('../util/utils');
const pageUtils = require('./page_utils');
const Cloudscraper = require('../util/cloudscraper');
const os = require('os');
const IPCHandler = require('./ipc_handler');
const translate = require('../translation');
const windowManager = require('../ui/window_manager');
const { Cache } = require('../storage/index');
const settings = require('../settings');
const APIError = require('./api_error');

class SessionHandler extends IPCHandler {
    constructor(app, apiKey, cookiePath) {
        super();
        this.app = app;
        this.apiKey = apiKey;
        this.cookiePath = cookiePath;
        this._online = true;
        this.translation = translate();

        this.provide('reload-request', ()  => {
            this.request = this.setupRequest();
        });

        this.provide('connectivity', (ev, state) => {
            this.online = state;
        });

        this.provide('clear-cache', () => {
            Cache.clearCache();
            windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.INFO), this.translation.get(ERRORS.OTHER.CACHE_CLEAR));
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
                windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.SEVERE), this.translation.get(ERRORS.CONNECTION.NO_NETWORK));
            } else {
                windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.INFO), this.translation.get(ERRORS.CONNECTION.NETWORK_RECONNECT));
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
        const disableUserAgent = settings.getGeneralSettings().disable_user_agent;
        const header = pageUtils.getHeaders(disableUserAgent, os.platform(), os.release(), this.apiKey);

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
            LOG.silly(`Got response with code ${response.statusCode} for url ${response.request.uri.path}`);
            const body = response.body;
            if(body.includes("Bitte aktualisiere die Seite")) {
                LOG.verbose("Proxer requested page reload.");
                return createRequest();
            } else if(body.includes("Retry for a live version")) {
                throw new Error("Offline");
            }

            return response;
        }).then(Cache.cacheResponse.bind(Cache)).catch((error) => {
            return this.handleError(error, doRequest);
        });
    }

    openApiRequest(doRequest) {
        const normalRequest = this.openRequest(doRequest);
        return normalRequest.then((response) => {
            LOG.verbose(response);
            let parsed;
            try {
                parsed = JSON.parse(response);
            } catch(e) {
                throw new Error("Invalid response")
            }

            if (parsed.error == 1) {
                throw new APIError(parsed.code, parsed.message);
            } else {
                return parsed;
            }
        });
    }

    handleError(error, doRequest) {
        if(error.statusCode == 303) { // Just rethrow to let login handle it.
            LOG.debug('Received 303 error, rethrowing for login handler.');
            throw error;
        }

        if(!error.options) { // Internal error
            console.error(error);
            return "";
        }

        const uri = error.options.uri;
        LOG.warn("Error when requesting " + uri);
        if(error.statusCode == 525) {
            LOG.error('Received error 525 on request');
            windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.PROXER.OFFLINE));
        } else if(error.statusCode == 500) {
            LOG.error('Received 500 error, probably MySQL down');
            windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.PROXER.MYSQL_DOWN));
        } else if(error.statusCode == 503) {
            LOG.error('Received 503 error, attempting cloudlfare circumvention');
            windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.PROXER.CLOUDFLARE));
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
            windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.SEVERE), this.translation.get(ERRORS.OTHER.UNKNOWN));
        }

        LOG.verbose("Trying response cache");
        const realUri = uri.substring(uri.indexOf('/', 9));

        let cached = Cache.getResponse(realUri);
        if(cached) {
            return cached.body;
        } else {
            LOG.error('No cached version found for uri ' + realUri);
            windowManager.notifyWindow('error', this.translation.get(ERRORS.SEVERITY.SEVERE), this.translation.get(ERRORS.CONNECTION.NO_CACHE));
            return "";
        }
    }
}
module.exports = SessionHandler;
