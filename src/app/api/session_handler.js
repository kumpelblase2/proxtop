var request = require('request-promise');
var cookieStore = require('tough-cookie-filestore');
var utils = require('../utils');
var pageUtils = require('./page_utils');

function SessionHandler(cookiePath) {
    this.cookiePath = cookiePath;
    this.app = require('../../../main');
}

SessionHandler.prototype.loadState = function() {
    var self = this;
    return utils.createIfNotExists(self.cookiePath).then(function() {
        self.cookieJar = request.jar(new cookieStore(self.cookiePath));
        LOG.verbose('Loaded cookies from ' + self.cookiePath);
        request = request.defaults({
            jar: self.cookieJar,
            headers: pageUtils.headers
        });
        self.request = request;
    }).return(self);
}

SessionHandler.prototype.openRequest = function(doRequest) {
    var self = this;

    var handleError = function(error) {
        if(error.statusCode == 525) {
            self.app.getWindow().send('error', 'severe', 'Website is down.');
        } else if(error.statusCode == 500) {
            self.app.getWindow().send('error', 'severe', 'MySQL error.');
        } else if(error.statusCode == 503) {
            self.app.getWindow().send('error', 'severe', 'CloudFlare DDoS protection, currently can\'t handle this.');
        } else {
            self.app.getWindow().send('error', 'severe', 'Unknown error occured: ' + error);
        }
    };

    var promise;
    if(typeof(doRequest) == 'string') {
        promise = this.request(doRequest);
    } else {
        promise = Promise.resolve(this.request).then(doRequest);
    }

    return promise.catch(handleError);
}

module.exports = SessionHandler;
