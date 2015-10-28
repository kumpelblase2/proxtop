var ipc = require('ipc');
var watchlistParser = require('../../page_parser').watchlist;
var Promise = require('bluebird');
var util = require('../utils');

function WatchlistHandler(sessionHandler) {
    this.session_handler = sessionHandler;
    this.cache = require('../db')('watchlist-cache');
    this.app = require('../../../main');
}

WatchlistHandler.prototype.loadWatchlist = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.WATCHLIST, true)
        .then(watchlistParser.parseWatchlist);
};

WatchlistHandler.prototype.checkUpdates = function() {
    var self = this;
    this.loadWatchlist().then(function(result) {
        var updates = {};
        var old = self.cache.find({ type: 'watchlist-cache' });
        updates.anime = util.getOnlineDiff(old.anime, result.anime);
        updates.manga = util.getOnlineDiff(old.manga, result.manga);
        self.cache.chain().find({ type: 'watchlist-cache' }).update({ anime: result.anime, manga: result.manga }).value();
        return updates;
    }).then(function(updates) {
        updates.forOwnProperty(function(type) {
            updates[type].forEach(function(update) {
                self.app.getWindow().send('new-' + type + '-ep', update);
            });
        });
    });
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
