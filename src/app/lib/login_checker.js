const pageUtils = require('./page_utils');
const _ = require('lodash');
const windowManager = require('../ui/window_manager');
const settings = require('../settings');

function getLoginDetails() {
    const account = settings.getAccountSettings();
    if(!account) {
        return null;
    }

    return _.pick(account, 'keep_login', 'user');
}

function ensureLogin(loginHandler, doRequest) {
    return (body) => {
        if(pageUtils.checkUnauthorized(body)) {
            const details = getLoginDetails();
            if(!details) {
                windowManager.notifyWindow('check-login', false);
                throw new Error(ERRORS.PROXER.NO_DETAILS_PROVIDED);
            }
            return loginHandler.login(details.user.username, details.user.password, details.keep_login)
                .then(doRequest);
        } else {
            return body;
        }
    };
}

function LoginChecker(sessionHandler, loginHandler) {
    sessionHandler._openRequest = sessionHandler.openRequest;
    sessionHandler.openRequest = ((doRequest, checkLogin) => {
        let request = sessionHandler._openRequest(doRequest);
        if(checkLogin) {
            request = request.then(ensureLogin(loginHandler, () => this._openRequest(doRequest)));
        }

        return request;
    }).bind(sessionHandler);
}

module.exports = LoginChecker;
