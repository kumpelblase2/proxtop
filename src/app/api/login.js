const { IPCHandler } = require('../lib');

class Login extends IPCHandler {
    constructor(loginHandler) {
        super();
        this.login = loginHandler;
    }

    register() {
        this.handle('logout', this.login.logout, this.login);
        this.handle('check-login', this.login.checkLogin, this.login);
        this.provide('login', (event, user, keepLogin) => {
            this.login.login(user.username, user.password, keepLogin)
                .then((result) => event.sender.send('login', result));
        });
    }
}

module.exports = Login;
