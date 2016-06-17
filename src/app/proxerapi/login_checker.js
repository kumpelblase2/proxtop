const pageUtils = require('./page_utils');
const _ = require('lodash');
const windowManager = require('../ui/window_manager');
const settings = require('../settings');

class LoginChecker {
    constructor(sessionHandler, loginHandler) {
        this.login_handler = loginHandler;
        sessionHandler._openRequest = sessionHandler.openRequest;
        const login = this;
        sessionHandler.openRequest = (function(doRequest, checkLogin) {
            let request = this._openRequest(doRequest);
            if(checkLogin) {
                request = request.then(login.checkLogin(() => this._openRequest(doRequest)));
            }

            return request;
        }).bind(sessionHandler);
    }

    checkLogin(doRequest) {
        return (body) => {
            if(pageUtils.checkUnauthorized(body)) {
                const details = this.getLoginDetails();
                if(!details) {
                    windowManager.notifyWindow('check-login', false);
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
        const account = settings.getAccountSettings();
        if(!account) {
            return null;
        }

        return _.pick(account, 'keep_login', 'user');
    }
}

module.exports = LoginChecker;
