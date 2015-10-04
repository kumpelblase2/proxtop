var ipc = require('ipc');
var watchlistParser = require('../../page_parser').watchlist;
var Promise = require('bluebird');

function WatchlistHandler(sessionHandler, loginChecker) {
    this.session_handler = sessionHandler;
    this.login_checker = loginChecker;
}

WatchlistHandler.prototype.loadWatchlist = function() {
    var self = this;
    return this.createRequest()
        .then(this.login_checker.checkLogin(this.createRequest.bind(this)))
        .then(watchlistParser.parseWatchlist);
};

WatchlistHandler.prototype.createRequest = function() {
    return this.session_handler.getRequest()(PROXER_BASE_URL + PROXER_PATHS.WATCHLIST);
};

WatchlistHandler.prototype.register = function() {
    var self = this;
    ipc.on('watchlist', function(event) {
        self.loadWatchlist().then(function(result) {
            event.sender.send('watchlist', result);
        });
    });
};

module.exports = WatchlistHandler;
