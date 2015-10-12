var request = require('request-promise');
var cookieStore = require('tough-cookie-filestore');
var utils = require('../utils');
var pageUtils = require('./page_utils');

function SessionHandler(cookiePath) {
    this.cookiePath = cookiePath;
    this.app = require('../../../main');
    this.db = require('../db');
}

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
    }).return(self);
};

SessionHandler.prototype.openRequest = function(doRequest) {
    var self = this;

    var handleError = function(error) {
        LOG.warn("Error when requesting " + error.options.uri);
        if(error.statusCode == 525) {
            self.app.getWindow().send('error', 'warning', 'Website is down.');
        } else if(error.statusCode == 500) {
            self.app.getWindow().send('error', 'warning', 'MySQL error.');
        } else if(error.statusCode == 503) {
            self.app.getWindow().send('error', 'warning', 'CloudFlare DDoS protection, currently can\'t handle this.');
        } else {
            self.app.getWindow().send('error', 'severe', 'Unknown error occured: ' + error);
        }

        LOG.verbose("Trying response cache");
        var realUri = error.options.uri;
        realUri = realUri.substring(realUri.indexOf('/', 9));

        var cached = self.getCachedResponse(realUri);
        if(cached) {
            return cached.body;
        } else {
            LOG.error('No cached version found for uri ' + realUri);
            self.app.getWindow().send('error', 'severe', 'No cached version found.');
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
