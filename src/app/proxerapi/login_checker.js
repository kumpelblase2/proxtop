const pageUtils = require('./page_utils');
const Promise = require('bluebird');
const _ = require('lodash');

class LoginChecker {
    constructor(app, sessionHandler, loginHandler, db) {
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

    checkLogin(doRequest) {
        return (body) => {
            if(pageUtils.checkUnauthorized(body)) {
                const details = this.getLoginDetails();
                if(!details) {
                    this.app.notifyWindow('check-login', false);
                    throw new Error(ERRORS.PROXER.NO_DETAILS_PROVIDED);
                }
                return this.login_handler.login(details.user.username, details.user.password, details.keep_login)
                        .then(doRequest);
            } else {
                return body;
            }
        };
    }

    getLoginDetails() {
        const settings = this.db('settings').find({ type: 'account' });
        if(!settings) {
            return null;
        }

        return _.pick(settings, 'keep_login', 'user');
    }
}

module.exports = LoginChecker;
