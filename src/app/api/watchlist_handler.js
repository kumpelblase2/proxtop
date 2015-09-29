var ipc = require('ipc');
var watchlistParser = require('../../page_parser').watchlist;
var Promise = require('bluebird');

function WatchlistHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

WatchlistHandler.prototype.loadWatchlist = function() {
    var self = this;
    return this.session_handler.getRequest()(PROXER_BASE_URL + PROXER_PATHS.WATCHLIST)
        .then(watchlistParser.parseWatchlist);
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
