const pageUtils = require('./page_utils');
const Promise = require('bluebird');
const _ = require('lodash');

function LoginChecker(app, sessionHandler, loginHandler, db) {
    this.login_handler = loginHandler;
    this.db = db;
    this.app = app;

    sessionHandler._openRequest = sessionHandler.openRequest;
    const login = this;
    sessionHandler.openRequest = (function(doRequest, checkLogin) {
        let request = this._openRequest(doRequest);
        const self = this;
        if(checkLogin) {
            request = request.then(login.checkLogin(function() {
                return self._openRequest(doRequest);
            }));
        }

        return request;
    }).bind(sessionHandler);
}

LoginChecker.prototype.checkLogin = function(doRequest) {
    const self = this;
    return function(body) {
        if(pageUtils.checkUnauthorized(body)) {
            const details = self.getLoginDetails();
            if(!details) {
                self.app.notifyWindow('check-login', false);
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
    const settings = this.db('settings').find({ type: 'account' });
    if(!settings) {
        return null;
    }

    return _.pick(settings, 'keep_login', 'user');
};

module.exports = LoginChecker;
