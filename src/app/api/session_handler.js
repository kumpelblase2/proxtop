var request = require('request-promise');
var cookieStore = require('tough-cookie-filestore');
var path = require('path');
var global = require('../global');
var utils = require('../utils');
var cheerio = require('cheerio');
var pageUtils = require('./page_utils');

function SessionHandler(app) {
    this.lastLogin = -1;
    this.sessionValid = -1;
    this.app = app;
    this.cookiePath = path.join(app.configPath, "cookie.json");
}

SessionHandler.prototype.loadState = function() {
    var self = this;
    return utils.createIfNotExists(self.cookiePath).then(function() {
        self.cookieJar = request.jar(new cookieStore(self.cookiePath));
        self.app.log.verbose('Loaded cookies from ' + self.cookiePath);
        self.app.log.verbose(self.cookieJar);
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
    return request(global.PROXER_BASE_URL + global.PROXER_PATHS.ROOT)
        .then(cheerio.load)
        .then(function(page) {
            if(!pageUtils.isLoggedIn(page)) {
                self.app.log.verbose('Not logged in yet, sending login');
                return Promise.resolve().then(function() {
                    return pageUtils.fillLogin(page, {
                        username: username,
                        password: password,
                        remember: keepLogin ? 'yes' : 'no'
                    });
                }).then(function(formData) {
                    return request.post({
                        url: global.PROXER_BASE_URL + global.PROXER_PATHS.LOGIN,
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
                        self.app.log.warn('There was an issue with logging in:');
                        self.app.log.warn(error);
                        return { success: false, reason: 'error'};
                    }
                });
            } else {
                self.app.log.verbose('Already logged in.');
                return { success: true, reason: 'already-logged-in' };
            }
        });
}

module.exports = SessionHandler;
