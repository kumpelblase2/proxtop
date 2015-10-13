var SessionHandler = require('./session_handler');
var LoginHandler = require('./login_handler');
var ProfileHandler = require('./profile_handler');
var WatchlistHandler = require('./watchlist_handler');
var NewsHandler = require('./news_handler');
var LoginChecker = require('./login_checker');
var MessageHandler = require('./message_handler');
var db = require('../db');

function API(cookiePath) {
    this.session_handler = new SessionHandler(cookiePath);
    this.login_handler = new LoginHandler(this.session_handler);
    this.login_checker = new LoginChecker(this.session_handler, this.login_handler, db);
    this.handers = [
        new ProfileHandler(this.session_handler),
        new WatchlistHandler(this.session_handler),
        new NewsHandler(this.session_handler),
        new MessageHandler(this.session_handler)
    ];
}

API.prototype.init = function() {
    this.login_handler.register();
    this.handers.forEach(function(elem) { elem.register(); });
    return this.session_handler.loadState();
}

module.exports = API;
