import { API_PATHS, PROXER_API_BASE_URL } from "../globals";
import Log from "../util/log";

export type LoginResult = {
    success: boolean,
    reason: string | null
}

export default class LoginHandler {
    session_handler: any;

    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    login(username, password, secondFactor = null): Promise<LoginResult> {
        Log.verbose("Logging in via API");

        let form = {
            username,
            password
        };

        if(secondFactor) {
            Log.debug("Using login with 2FA token");
            // @ts-ignore
            form.secretkey = secondFactor;
        }

        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.USER.LOGIN,
                form
            });
        }, {}, false).then((content) => {
            Log.verbose("Login success");
            this.session_handler.setSession(content.data);
            return { success: true, reason: null }
        }).catch((ex) => {
            if(ex && ex.code === 3038) {
                Log.info("2FA is enabled for the user.");
                return {
                    success: false,
                    reason: '2fa_enabled'
                }
            } else {
                return { success: false, reason: ex };
            }
        });
    }

    logout(): Promise<void> {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.USER.LOGOUT
            });
        }, {}, false);
    }

    checkLogin(): boolean {
        const hasSession = this.session_handler.hasSession();
        Log.debug("Is session alive? " + hasSession);
        return hasSession;
    }
}
