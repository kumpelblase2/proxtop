const watchlistParser = require('../../page_parser').watchlist;
const util = require('util');
const utils = require('../util/utils');
const translate = require('../translation');
const { WatchlistCache } = require('../storage');
const settings = require('../settings');
const Notification = require('../notification');
const windowManager = require('../ui/window_manager');

const SET_TO_CURRENT = "?format=json&type=reminder&title=reminder_this";

const returnMsg = (success, msg) => { return { success: success, msg: msg } };

function alterWatchlist(list) {
    const result = { anime: [], manga: [] };

    list.map((entry) => {
        return {
            type: entry.kat,
            name: entry.name,
            status: entry.state,
            episode: entry.episode,
            entry: entry.eid,
            sub: entry.language,
            id: entry.id
        };
    }).forEach((entry) => {
        if(entry.type === "anime") {
            result.anime.push(entry);
        } else {
            result.manga.push(entry);
        }
    });

    return result;
}

class WatchlistHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
        this.lastCheck = 0;
        this.translation = translate();
    }

    apiLoadWatchlist() {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.WATCHLIST.GET)
            .then((data) => data.data).then(alterWatchlist);
    }

    loadWatchlist() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.WATCHLIST)
            .then(watchlistParser.parseWatchlist);
    }

    checkUpdates() {
        LOG.info("Checking for new watchlist updates");
        this.lastCheck = new Date().getTime();
        this.loadWatchlist().then((result) => {
            const old = WatchlistCache.getOldWatchlist();
            if(!old) {
                WatchlistCache.saveWatchlist(result);

                const onlineFilter = entry => !!entry.status;

                return {
                    anime: result.anime.filter(onlineFilter),
                    manga: result.manga.filter(onlineFilter)
                };
            }

            const updates = {};
            updates.anime = utils.getOnlineDiff(old.anime, result.anime);
            updates.manga = utils.getOnlineDiff(old.manga, result.manga);
            WatchlistCache.updateWatchlist(result);
            return updates;
        }).then((updates) => {
            Object.keys(updates).forEach((type) => {
                updates[type].forEach((update) => {
                    LOG.verbose('Sending watchlist update for ' + update.name);
                    Notification.displayNotification({
                        title: 'Proxtop',
                        message: this.translation.get(`WATCHLIST.NEW_${type.toUpperCase()}`, { episode: update.episode, name: update.name }),
                        icon: LOGO_RELATIVE_PATH
                    }, () => {
                        windowManager.notifyWindow('state-change', 'watch', {
                            id: update.id,
                            ep: update.episode,
                            sub: update.sub
                        });
                    });
                });
            });
        });
    }

    _updateEntry(id, ep, sub) {
        return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub) + SET_TO_CURRENT)
            .then(watchlistParser.parseUpdateReponse).then((msg) => returnMsg(true, msg.msg)).catch(() => returnMsg(false, "Not Found"));
    }

    updateEntry(kat, id, episode, language) {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.WATCHLIST.SET,
                form: {
                    id,
                    kat,
                    episode,
                    language
                }
            });
        }).then(() => returnMsg(true, "")).catch(() => returnMsg(false, "Not found"));
    }

    _markFinished(id) {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.ANIME.UPDATE_STATUS,
                form: {
                    id,
                    type: "finish"
                }
            });
        }).then(() => returnMsg(true, "")).catch(() => returnMsg(false, "Not Found"));
    }

    markFinished(_category, id, ep) {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.WATCHLIST.SET_EPISODE,
                form: {
                    id,
                    value: parseInt(ep) + 1
                }
            });
        });
    }

    deleteEntry(entry) {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.WATCHLIST.REMOVE,
                form: {
                    id: entry
                }
            });
        }).then(() => ({ entry: entry }));
    }

    watchLoop() {
        setTimeout(() => {
            const time = settings.getWatchlistSettings().check_interval;
            if(new Date().getTime() - this.lastCheck > time * 60000 - 5000) {
                this.checkUpdates();
            }

            this.watchLoop();
        }, 30000);
    }
}

module.exports = WatchlistHandler;
