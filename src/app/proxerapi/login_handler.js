const loginParser = require('../../page_parser').login;
const Promise = require('bluebird');
const _ = require('lodash');

class LoginHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    login(username, password, keepLogin = false) {
        const self = this;
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.ROOT)
            .then(loginParser.parseLogin)
            .then((result) => {
                if(result.status === 'logged-in') {
                    LOG.verbose('Already logged in.');
                    return { success: true, reason: 'already-logged-in' };
                } else if(result.status === 'logged-out'){
                    LOG.verbose('Not logged in yet, sending login with following details:');
                    LOG.verbose('Username: ' + username + '; Pass: ' + (!password || password.length == 0 ? 'No' : '****'));
                    return Promise.resolve(result.data).then((data) => {
                        return _.merge(data, {
                            username: username,
                            password: password,
                            remember: keepLogin ? 'yes' : 'no'
                        });
                    }).then((formData) => {
                        return self.session_handler.openRequest((request) => {
                            return request.post({
                                url: PROXER_BASE_URL + PROXER_PATHS.LOGIN,
                                form: formData
                            });
                        })
                    }).catch((error) => {
                        if(error.statusCode === 303) {
                            const location = error.response.headers.location;
                            if(location === '/' || location === 'https://proxer.me/') {
                                LOG.info("Logged in");
                                return { success: true, reason: null };
                            } else {
                                LOG.warn('Couldn\'t login, invalid info.');
                                return { success: false, reason: 'invalid' };
                            }
                        } else {
                            LOG.warn('There was an issue with logging in:');
                            LOG.warn(error);
                            return { success: false, reason: 'error' };
                        }
                    });
                } else {
                    LOG.warn('Could not determine if user is already logged in or not');
                    return { success: false, reason: 'error' };
                }
            });
    }

    logout() {
        const self = this;
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.ROOT)
            .then(loginParser.parseLogout)
            .then((result) => {
                if(result.status === 'logged-out') {
                    LOG.verbose('Already logged out.');
                    return { success: true, reason: 'already-logged-in' };
                } else if(result.status === 'logout'){
                    LOG.verbose('Still logged in, logging out.');
                    return Promise.resolve(result.data).then((formData) => {
                        return self.session_handler.openRequest((request) => {
                            return request.post({
                                url: PROXER_BASE_URL + PROXER_PATHS.LOGOUT,
                                form: formData
                            });
                        });
                    }).catch((error) => {
                        if(error.statusCode === 303) {
                            LOG.info('Logged out.');
                            return { success: true, reason: null };
                        } else {
                            LOG.warn('There was an issue with logging out:');
                            LOG.warn(error);
                            return { success: false, reason: 'error' };
                        }
                    });
                } else {
                    LOG.warn('Could not determine if user is already logged put or not');
                    return { success: false, reason: 'error' };
                }
            });
    }

    checkLogin() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.API_LOGIN)
            .then(loginParser.parseLoginCheck);
    }
}

module.exports = LoginHandler;
