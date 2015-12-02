var pageUtils = require('./page_utils');
var Promise = require('bluebird');
var _ = require('lodash');

function LoginChecker(sessionHandler, loginHandler, db) {
    this.login_handler = loginHandler;
    this.db = db;
    this.app = require('../../../main');

    sessionHandler._openRequest = sessionHandler.openRequest;
    var login = this;
    sessionHandler.openRequest = (function(doRequest, checkLogin) {
        var request = this._openRequest(doRequest);
        var self = this;
        if(checkLogin) {
            request = request.then(login.checkLogin(function() {
                return self._openRequest(doRequest);
            }));
        }

        return request;
    }).bind(sessionHandler);
}

LoginChecker.prototype.checkLogin = function(doRequest) {
    var self = this;
    return function(body) {
        if(pageUtils.checkUnauthorized(body)) {
            var details = self.getLoginDetails();
            if(!details) {
                self.app.getWindow().send('check-login', false);
                throw new Error(ERRORS.PROXER.NO_DETAILS_PROVIDED);
            }
            return self.login_handler.login(details.user.username, details.user.password, details.keep_login)
                    .then(doRequest);
        } else {
            return body;
        }
    };
};

LoginChecker.prototype.getLoginDetails = function() {
    var settings = this.db('settings').find({ type: 'account' });
    if(!settings) {
        return null;
    }

    return _.pick(settings, 'keep_login', 'user');
};

module.exports = LoginChecker;
