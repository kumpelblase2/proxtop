import { API_PATHS, PROXER_API_BASE_URL } from "../globals";
import SessionHandler from "../lib/session_handler";

export type News = {
    nid: number,
    time: number,
    mid: number,
    description: string,
    image_id: number,
    image_style: string,
    subject: string,
    hits: number,
    thread: number,
    uid: number,
    uname: string,
    posts: number,
    catid: number,
    catname: string
}

export default class NewsHandler {
    session_handler: SessionHandler;

    constructor(sessionHandler: SessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadNews(): Promise<News[]> {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.NOTIFICATIONS.NEWS)
            .then(full => full.data);
    }
}
