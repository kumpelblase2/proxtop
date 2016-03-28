var SessionHandler = require('./session_handler');
var LoginHandler = require('./login_handler');
var ProfileHandler = require('./profile_handler');
var WatchlistHandler = require('./watchlist_handler');
var NewsHandler = require('./news_handler');
var LoginChecker = require('./login_checker');
var MessageHandler = require('./message_handler');
var EpisodeHandler = require('./episode_handler');
var db = require('../db');

function API(app, cookiePath) {
    this.session_handler = new SessionHandler(app, cookiePath);
    this.login_handler = new LoginHandler(this.session_handler);
    this.login_checker = new LoginChecker(app, this.session_handler, this.login_handler, db);
    this.handers = [
        new ProfileHandler(this.session_handler),
        new WatchlistHandler(app, this.session_handler),
        new NewsHandler(this.session_handler),
        new MessageHandler(app, this.session_handler),
        new EpisodeHandler(this.session_handler)
    ];
}

API.prototype.init = function() {
    this.login_handler.register();
    this.handers.forEach(function(elem) { elem.register(); });
    return this.session_handler.loadState();
};

module.exports = API;
