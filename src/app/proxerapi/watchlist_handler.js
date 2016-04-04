const ipc = require('electron').ipcMain;
const watchlistParser = require('../../page_parser').watchlist;
const Promise = require('bluebird');
const util = require('util');
const utils = require('../utils');
const translate = require('../translation');
const IPCHandler = require('./ipc_handler');

const SET_TO_CURRENT = "?format=json&type=reminder&title=reminder_this";
const SET_FINISHED = "?format=json&type=reminder&title=reminder_finish";

const returnMsg = (success, msg) => { return { success: success, msg: msg } };


class WatchlistHandler extends IPCHandler {
    constructor(app, sessionHandler) {
        super();
        this.session_handler = sessionHandler;
        this.cache = require('../db')('watchlist-cache');
        this.app = app;
        this.settings = require('../settings');
        this.lastCheck = 0;
        this.translation = translate();
    }

    loadWatchlist() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.WATCHLIST)
            .then(watchlistParser.parseWatchlist);
    }

    checkUpdates() {
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

                const onlineFilter = entry => entry.status;

                return {
                    anime: result.anime.filter(onlineFilter),
                    manga: result.manga.filter(onlineFilter)
                };
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
                    self.app.displayNotification({
                        type: 'new-' + type + '-ep',
                        title: 'Proxtop',
                        content: self.translation.get(`WATCHLIST.NEW_${type.toUpperCase()}`, { episode: update.episode, name: update.name }),
                        icon: 'assets/proxtop_logo_256.png'
                    });
                });
            });
        });
    }

    updateEntry(id, ep, sub) {
        return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub) + SET_TO_CURRENT)
            .then(watchlistParser.parseUpdateReponse).then((msg) => returnMsg(true, msg.msg)).catch(() => returnMsg(false, "Not Found"));
    }

    markFinished(id, ep, sub) {
        return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub) + SET_FINISHED)
            .then(watchlistParser.parseFinishResponse).then((msg) => returnMsg(true, msg.msg)).catch(() => returnMsg(false, "Not Found"));
    }

    deleteEntry(entry) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.DELETE_WATCHLIST + entry)
            .then(watchlistParser.parseDeleteResponse).then(function(msg) {
                if(msg.error == 1) {
                    throw "Could not update watchlist";
                } else {
                    msg.entry = entry;
                    return msg;
                }
            });
    }

    register() {
        this.handle('watchlist', this.loadWatchlist);
        ipc.on('watchlist-update', () => this.checkUpdates());
        this.handle('add-watchlist', this.updateEntry);
        this.handle('delete-watchlist', this.deleteEntry);
        this.handle('finish-watchlist', this.markFinished);

        this.watchLoop();
    }

    watchLoop() {
        const self = this;
        setTimeout(function() {
            const time = self.settings.getWatchlistSettings().check_interval;
            if(new Date().getTime() - self.lastCheck > time * 60000 - 5000) {
                self.checkUpdates();
            }

            self.watchLoop();
        }, 30000);
    }
}

module.exports = WatchlistHandler;
