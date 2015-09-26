var request = require('request-promise');
var cookieStore = require('tough-cookie-filestore');
var path = require('path');
var utils = require('../utils');
var pageUtils = require('./page_utils');
var loginParser = require('../../page_parser').login;

function SessionHandler(app) {
    this.lastLogin = -1;
    this.sessionValid = -1;
    this.app = app;
    this.cookiePath = path.join(APP_DIR, "cookie.json");
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

SessionHandler.prototype.isLoggedIn = function() {
    if(this.lastLogin < 0 || Math.floor(Date.now() / 1000) < this .sessionValid) {
        return false;
    }
    return true;
};

SessionHandler.prototype.login = function(username, password, keepLogin) {
    if(typeof(keepLogin) === "undefined") {
        keepLogin = this.settings.store_password;
    }

    var self = this;
    return request(PROXER_BASE_URL + PROXER_PATHS.ROOT)
        .then(loginParser.parseLogin)
        .then(function(result) {
            if(result.status === 'logged-in') {
                LOG.verbose('Already logged in.');
                return { success: true, reason: 'already-logged-in' };
            } else if(result.status === 'logged-out'){
                LOG.verbose('Not logged in yet, sending login');
                return Promise.resolve().then(function() {
                    return pageUtils.fillLogin(result.data, {
                        username: username,
                        password: password,
                        remember: keepLogin ? 'yes' : 'no'
                    });
                }).then(function(formData) {
                    return request.post({
                        url: PROXER_BASE_URL + PROXER_PATHS.LOGIN,
                        form: formData
                    });
                }).catch(function(error) {
                    if(error.statusCode === 303) {
                        if(error.response.headers.location === '/') {
                            console.log("Logged in");
                            return { success: true, reason: null };
                        } else {
                            return { success: false, reason: 'invalid' };
                        }
                    } else {
                        LOG.warn('There was an issue with logging in:');
                        LOG.warn(error);
                        return { success: false, reason: 'error'};
                    }
                });
            } else {
                return { success: false, reason: 'error' };
            }
        });
}

module.exports = SessionHandler;
