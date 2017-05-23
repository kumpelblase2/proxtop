class LoginHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    login(username, password, secondFactor = null) {
        LOG.verbose("Logging in via API");

        let form = {
            username,
            password
        };

        if(secondFactor) {
            LOG.debug("Using login with 2FA token");
            form.secretkey = secondFactor;
        }

        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.USER.LOGIN,
                form
            });
        }, {}, false).then((content) => {
            LOG.verbose("Login success");
            this.session_handler.setSession(content.data);
            return { success: true, reason: null }
        }).catch((ex) => {
            if(ex && ex.code === 3038) {
                LOG.info("2FA is enabled for the user.");
                return {
                    success: false,
                    reason: '2fa_enabled'
                }
            } else {
                return { success: false, reason: ex };
            }
        });
    }

    logout() {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.USER.LOGOUT
            });
        }, {}, false);
    }

    checkLogin() {
        const hasSession = this.session_handler.hasSession();
        LOG.debug("Is session alive? " + hasSession);
        return hasSession;
    }
}

module.exports = LoginHandler;
