import OpenHandler from "./open_handler";
import UserProfileManager from "./user_profile";
import EpisodeManager from "./episodes";
import LoginManager from "./login";
import WatchlistManager from "./watchlist";
import NewsManager from "./news";
import MessageManager from "./messages";
import IPCHandler from "../lib/ipc_handler";

export default class API {
    proxer: any;
    handlers: Array<IPCHandler>;

    constructor(proxerAPI) {
        this.proxer = proxerAPI;
        this.handlers = [
            new OpenHandler(),
            new UserProfileManager(proxerAPI.profile),
            new EpisodeManager(proxerAPI.episode),
            new LoginManager(proxerAPI.login),
            new WatchlistManager(proxerAPI.watchlist),
            new NewsManager(proxerAPI.news),
            new MessageManager(proxerAPI.messages)
        ];
    }

    init() {
        this.handlers.forEach(elem => { elem.register(); });
    }
}
