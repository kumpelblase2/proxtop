var ipc = require('ipc');
var loginParser = require('../../page_parser').login;
var Promise = require('bluebird');
var pageUtils = require('./page_utils');

function LoginHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

LoginHandler.prototype.login = function(username, password, keepLogin) {
    keepLogin = keepLogin || false;

    var self = this;
    return this.session_handler.getRequest()(PROXER_BASE_URL + PROXER_PATHS.ROOT)
        .then(loginParser.parseLogin)
        .then(function(result) {
            if(result.status === 'logged-in') {
                LOG.verbose('Already logged in.');
                return { success: true, reason: 'already-logged-in' };
            } else if(result.status === 'logged-out'){
                LOG.verbose('Not logged in yet, sending login');
                return Promise.resolve(result.data).then(function(data) {
                    return pageUtils.fillLogin(data, {
                        username: username,
                        password: password,
                        remember: keepLogin ? 'yes' : 'no'
                    });
                }).then(function(formData) {
                    return self.session_handler.getRequest().post({
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
                LOG.warn('Could not determine if user is already logged in or not');
                return { success: false, reason: 'error' };
            }
        });
};

LoginHandler.prototype.checkLogin = function() {
    return this.session_handler.getRequest()(PROXER_BASE_URL + PROXER_PATHS.API_LOGIN)
        .then(function(result) {
            console.log(result);
            var response = JSON.parse(result);
            return response.error == 0;
        });
}

LoginHandler.prototype.register = function() {
    var self = this;
    ipc.on('login', function(event, user, keepLogin) {
        self.login(user.username, user.password, keepLogin).then(function(result) {
            event.sender.send('login', result);
        });
    });

    ipc.on('check-login', function(event) {
        self.checkLogin().then(function(result) {
            event.sender.send('check-login', result);
        });
    });
};

module.exports = LoginHandler;
