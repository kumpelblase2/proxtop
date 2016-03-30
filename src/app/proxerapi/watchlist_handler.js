const ipc = require('electron').ipcMain;
const watchlistParser = require('../../page_parser').watchlist;
const Promise = require('bluebird');
const util = require('util');
const utils = require('../utils');

const SET_TO_CURRENT = "?format=json&type=reminder&title=reminder_this";
const SET_FINISHED = "?format=json&type=reminder&title=reminder_finish";

function WatchlistHandler(app, sessionHandler) {
    this.session_handler = sessionHandler;
    this.cache = require('../db')('watchlist-cache');
    this.app = app;
    this.settings = require('../settings');
    this.lastCheck = 0;
}

WatchlistHandler.prototype.loadWatchlist = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.WATCHLIST)
        .then(watchlistParser.parseWatchlist);
};

WatchlistHandler.prototype.checkUpdates = function() {
    const self = this;
    LOG.info("Checking for new watchlist updates");
    this.lastCheck = new Date().getTime();
    this.loadWatchlist().then(function(result) {
        const old = self.cache.find({ type: 'watchlist-cache' });
        if(!old) {
            self.cache.push({
                type: 'watchlist-cache',
                anime: result.anime,
                manga: result.manga
            });
            return result;
        }

        const updates = {};
        updates.anime = utils.getOnlineDiff(old.anime, result.anime);
        updates.manga = utils.getOnlineDiff(old.manga, result.manga);
        self.cache.chain().find({ type: 'watchlist-cache' }).merge({ anime: result.anime, manga: result.manga }).value();
        return updates;
    }).then(function(updates) {
        Object.keys(updates).forEach(function(type) {
            updates[type].forEach(function(update) {
                LOG.verbose('Sending watchlist update for ' + update.name);
                self.app.notifyWindow('new-' + type + '-ep', update);
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

WatchlistHandler.prototype.markFinished = function(id, ep, sub) {
    return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub) + SET_FINISHED)
        .then(watchlistParser.parseFinishResponse).then(function(msg) {
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

WatchlistHandler.prototype.deleteEntry = function(entry) {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.DELETE_WATCHLIST + entry)
        .then(watchlistParser.parseDeleteResponse).then(function(msg) {
            if(msg.error == 1) {
                throw "Could not update watchlist";
            } else {
                return msg;
            }
        });
};

WatchlistHandler.prototype.register = function() {
    const self = this;
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

    ipc.on('delete-watchlist', function(event, entry) {
        self.deleteEntry(entry).then(function(res) {
            res.entry = entry;
            event.sender.send('delete-watchlist', res);
        });
    });

    ipc.on('finish-watchlist', function(event, id, ep, sub) {
        self.markFinished(id, ep, sub).then(function(result) {
            event.sender.send('finish-watchlist', result);
        });
    });

    this.watchLoop();
};

WatchlistHandler.prototype.watchLoop = function() {
    const self = this;
    setTimeout(function() {
        const time = self.settings.getWatchlistSettings().check_interval;
        if(new Date().getTime() - self.lastCheck > time * 60000 - 5000) {
            self.checkUpdates();
        }

        self.watchLoop();
    }, 30000);
};

module.exports = WatchlistHandler;
