import { API_PATHS, PROXER_API_BASE_URL } from "../globals";

export default class NewsHandler {
    session_handler: any;

    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadNews() {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.NOTIFICATIONS.NEWS)
            .then(full => full.data);
    }
}
