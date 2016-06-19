const OpenHandler = require('./open_handler');
const UserProfileManager = require('./user_profile');
const EpisodeManager = require('./episodes');
const LoginManager = require('./login');
const ensureLogin = require('../lib/login_checker');
const WatchlistManager = require('./watchlist');
const NewsManager = require('./news');
const MessageManager = require('./messages');

class API {
    constructor(proxerAPI) {
        this.proxer = proxerAPI;
        ensureLogin(this.proxer.session_handler, this.proxer.login);
        this.handers = [
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
        this.handers.forEach(function(elem) { elem.register(); });
    }
}

module.exports = API;
