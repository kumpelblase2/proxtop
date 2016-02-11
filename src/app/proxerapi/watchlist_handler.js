var ipc = require('ipc');
var watchlistParser = require('../../page_parser').watchlist;
var Promise = require('bluebird');
var util = require('util');
var utils = require('../utils');

var SET_TO_CURRENT = "?format=json&type=reminder&title=reminder_this";

function WatchlistHandler(sessionHandler) {
    this.session_handler = sessionHandler;
    this.cache = require('../db')('watchlist-cache');
    this.app = require('../../../main');
    this.settings = require('../settings');
}

WatchlistHandler.prototype.loadWatchlist = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.WATCHLIST)
        .then(watchlistParser.parseWatchlist);
};

WatchlistHandler.prototype.checkUpdates = function() {
    var self = this;
    LOG.info("Checking for new watchlist updates");
    this.lastCheck = new Date().getTime();
    this.loadWatchlist().then(function(result) {
        var old = self.cache.find({ type: 'watchlist-cache' });
        if(!old) {
            self.cache.push({
                type: 'watchlist-cache',
                anime: result.anime,
                manga: result.manga
            });
            return result;
        }

        var updates = {};
        updates.anime = utils.getOnlineDiff(old.anime, result.anime);
        updates.manga = utils.getOnlineDiff(old.manga, result.manga);
        self.cache.chain().find({ type: 'watchlist-cache' }).merge({ anime: result.anime, manga: result.manga }).value();
        return updates;
    }).then(function(updates) {
        Object.keys(updates).forEach(function(type) {
            updates[type].forEach(function(update) {
                self.app.getWindow().send('new-' + type + '-ep', update);
            });
        });
    });
};

WatchlistHandler.prototype.updateEntry = function(id, ep, sub) {
    return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub) + SET_TO_CURRENT)
        .then(watchlistParser.parseUpdateReponse).then(function(msg) {
            return {
                success: true,
                msg: msg.msg
            };
        }).catch(function(e) {
            return {
                success: false,
                msg: "Not Found"
            };
        });
};

WatchlistHandler.prototype.register = function() {
    var self = this;
    ipc.on('watchlist', function(event) {
        self.loadWatchlist().then(function(result) {
            event.sender.send('watchlist', result);
        });
    });

    ipc.on('watchlist-update', function(event) {
        self.checkUpdates();
    });

    ipc.on('add-watchlist', function(event, id, ep, sub) {
        self.updateEntry(id, ep, sub).then(function(result) {
            event.sender.send('add-watchlist', result);
        });
    });

    this.watchLoop();
};

WatchlistHandler.prototype.watchLoop = function() {
    var self = this;
    setTimeout(function() {
        var time = self.settings.getWatchlistSettings().check_interval;
        if(new Date().getTime() - self.lastCheck > time * 55000) {
            self.checkUpdates();
        }

        self.watchLoop();
    }, 30000);
};

module.exports = WatchlistHandler;
