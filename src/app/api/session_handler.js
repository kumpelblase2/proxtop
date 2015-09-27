var request = require('request-promise');
var cookieStore = require('tough-cookie-filestore');
var utils = require('../utils');
var pageUtils = require('./page_utils');

function SessionHandler(cookiePath) {
    this.cookiePath = cookiePath;
}

SessionHandler.prototype.loadState = function() {
    var self = this;
    return utils.createIfNotExists(self.cookiePath).then(function() {
        self.cookieJar = request.jar(new cookieStore(self.cookiePath));
        LOG.verbose('Loaded cookies from ' + self.cookiePath);
        request = request.defaults({
            jar: self.cookieJar,
            headers: pageUtils.headers()
        });
        self.request = request;
    }).return(self);
}

SessionHandler.prototype.getRequest = function() {
    return this.request;
}

module.exports = SessionHandler;
