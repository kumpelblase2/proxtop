const LoginHandler = require('./login_handler');
const ProfileHandler = require('./profile_handler');
const WatchlistHandler = require('./watchlist_handler');
const NewsHandler = require('./news_handler');
const MessageHandler = require('./message_handler');
const EpisodeHandler = require('./episode_handler');

function setup(sessionHandler) {
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

module.exports = setup;
