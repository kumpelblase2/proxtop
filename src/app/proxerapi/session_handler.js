var request = require('request-promise');
var cookieStore = require('tough-cookie-filestore');
var utils = require('../utils');
var pageUtils = require('./page_utils');
var Cloudscraper = require('../cloudscraper');

function SessionHandler(app, cookiePath) {
    this.app = app;
    this.cookiePath = cookiePath;
    this.db = require('../db');
    this.online = true;
}

SessionHandler.prototype.isOnline = function() { return this.online; };

SessionHandler.prototype.loadState = function() {
    var self = this;
    return utils.createIfNotExists(self.cookiePath).then(function() {
        self.cookieJar = request.jar(new cookieStore(self.cookiePath));
        LOG.verbose('Loaded cookies from ' + self.cookiePath);
        request = request.defaults({
            jar: self.cookieJar,
            headers: pageUtils.headers,
            resolveWithFullResponse: true
        });
        self.request = request;
        self.cloudscraper = new Cloudscraper(request);
    }).return(self);
};

SessionHandler.prototype.openRequest = function(doRequest) {
    var self = this;

    var handleError = function(error) {
        if(error.statusCode == 303) { // Just rethrow to let login handle it.
            LOG.debug('Received 303 error, rethrowing for login handler.');
            throw error;
        }

        LOG.warn("Error when requesting " + error.options.uri);
        if(error.statusCode == 525) {
            LOG.error('Received error 525 on request');
            self.app.notifyWindow('error', ERRORS.SEVERITY.WARNING, ERRORS.PROXER.OFFLINE);
        } else if(error.statusCode == 500) {
            LOG.error('Received 500 error, probably MySQL down');
            self.app.notifyWindow('error', ERRORS.SEVERITY.WARNING, ERRORS.PROXER.MYSQL_DOWN);
        } else if(error.statusCode == 503) {
            LOG.error('Received 503 error, attempting cloudlfare circumvention');
            self.app.notifyWindow('error', ERRORS.SEVERITY.WARNING, ERRORS.PROXER.CLOUDFLARE);
            return self.cloudscraper.handle(error.response, error.response.body);
        } else if(/getaddr/.test(error.message)) {
            LOG.error('Other error but contained "getaddr" so it\'s probably no network:');
            LOG.error(error.message);
            if(self.isOnline()) {
                self.online = false;
                self.app.notifyWindow('error', ERRORS.SEVERITY.SEVERE, ERRORS.CONNECTION.NO_NETWORK);
            }
        } else {
            LOG.error('Unknown error occurred: ' + error.message);
            self.app.notifyWindow('error', ERRORS.SEVERITY.SEVERE, ERRORS.OTHER.UNKNOWN);
        }

        LOG.verbose("Trying response cache");
        var realUri = error.options.uri;
        realUri = realUri.substring(realUri.indexOf('/', 9));

        var cached = self.getCachedResponse(realUri);
        if(cached) {
            return cached.body;
        } else {
            LOG.error('No cached version found for uri ' + realUri);
            self.app.notifyWindow('error', ERRORS.SEVERITY.SEVERE, ERRORS.CONNECTION.NO_CACHE);
            return "";
        }
    };

    var promise;
    if(typeof(doRequest) == 'string') {
        promise = this.request(doRequest);
    } else {
        promise = Promise.resolve(this.request).then(doRequest);
    }

    return promise.then(this.cacheResponse.bind(this)).catch(handleError);
};

SessionHandler.prototype.cacheResponse = function(response) {
    var url = response.request.path;
    var body = response.body;
    this.online = true;
    if(this.db('cache').find({ url: url })) {
        this.db('cache').chain().find({ url: url }).merge({ body: body }).value();
    } else {
        this.db('cache').push({ url: url, body: body });
    }

    return body;
};

SessionHandler.prototype.getCachedResponse = function(url) {
    LOG.info("Return cached reponse for request to " + url);
    return this.db('cache').find({ url: url });
};

module.exports = SessionHandler;
