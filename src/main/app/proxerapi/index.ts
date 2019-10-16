import LoginHandler from "./login_handler";
import ProfileHandler from "./profile_handler";
import WatchlistHandler from "./watchlist_handler";
import NewsHandler from "./news_handler";
import MessageHandler from "./message_handler";
import EpisodeHandler from "./episode_handler";
import SessionHandler from "../lib/session_handler";

export default function setup(sessionHandler: SessionHandler) {
    return {
        session_handler: sessionHandler,
        login: new LoginHandler(sessionHandler),
        profile: new ProfileHandler(sessionHandler),
        watchlist: new WatchlistHandler(sessionHandler),
        news: new NewsHandler(sessionHandler),
        messages: new MessageHandler(sessionHandler),
        episode: new EpisodeHandler(sessionHandler)
    };
}
