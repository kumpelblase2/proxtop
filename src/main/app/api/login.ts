import IPCHandler from "../lib/ipc_handler";
import LoginHandler from "../proxerapi/login_handler";

export default class Login extends IPCHandler {
    login: LoginHandler;

    constructor(loginHandler: LoginHandler) {
        super();
        this.login = loginHandler;
    }

    register() {
        // @ts-ignore
        this.handle('logout', this.login.logout, this.login);
        // @ts-ignore
        this.handle('check-login', this.login.checkLogin, this.login);
        this.handle('login', (user, secondFactor) => {
            return this.login.login(user.username, user.password, secondFactor);
        });
    }
}
