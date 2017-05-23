const { IPCHandler } = require('../lib');

class Login extends IPCHandler {
    constructor(loginHandler) {
        super();
        this.login = loginHandler;
    }

    register() {
        this.handle('logout', this.login.logout, this.login);
        this.handle('check-login', this.login.checkLogin, this.login);
        this.handle('login', (user, secondFactor) => {
            return this.login.login(user.username, user.password, secondFactor);
        });
    }
}

module.exports = Login;
