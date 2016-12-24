const _ = require('lodash');

class LoginHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    login(username, password) {
        LOG.verbose("Logging in via API");
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.USER.LOGIN,
                form: {
                    username,
                    password
                }
            });
        }).then((content) => {
            LOG.verbose("Login success");
            this.session_handler.setSession(content.data);
            return { success: true, reason: null }
        }).catch((ex) => ({ success: false, reason: ex }));
    }

    logout() {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.USER.LOGOUT
            });
        });
    }

    checkLogin() {
        const hasSession = this.session_handler.hasSession();
        LOG.debug("Is session alive? " + hasSession);
        return hasSession;
    }
}

module.exports = LoginHandler;
