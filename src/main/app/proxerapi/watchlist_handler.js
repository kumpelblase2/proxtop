import { getOnlineDiff } from "../util/utils";
import { Instance as Notification } from "../notification";
import windowManager from "../ui/window_manager";
import settings from "../settings";
import Log from "../util/log";
import translate from "../translation";
import watchlistParser from "../../page_parser/watchlist"
import { WatchlistCache } from "../storage";
import {PROXER_API_BASE_URL, PROXER_BASE_URL, API_PATHS, PROXER_PATHS, LOGO_RELATIVE_PATH} from "../globals";

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

export default class WatchlistHandler {
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
        Log.info("Checking for new watchlist updates");
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
            updates.anime = getOnlineDiff(old.anime, result.anime);
            updates.manga = getOnlineDiff(old.manga, result.manga);
            WatchlistCache.updateWatchlist(result);
            return updates;
        }).then((updates) => {
            Object.keys(updates).forEach((type) => {
                updates[type].forEach((update) => {
                    Log.verbose('Sending watchlist update for ' + update.name);
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

    updateEntry(kat, id, episode, language) {
        Log.debug(`Updating entry with ID ${id} to episode ${episode}.`);
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

    markFinished(_category, id, ep) {
        const finishValue = parseInt(ep) + 1;
        Log.debug(`Marking anime with ID ${id} as finished. (Setting Episode value to ${finishValue})`);
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.WATCHLIST.SET_EPISODE,
                form: {
                    id,
                    value: parseInt(finishValue) + 1
                }
            });
        });
    }

    deleteEntry(entry) {
        Log.debug(`Removing reminder with id ${entry}.`);
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.WATCHLIST.REMOVE,
                form: {
                    id: entry
                }
            });
        }).then(() => ({ entry: entry }));
    }

    watchLoop(interval = 30000) {
        setTimeout(() => {
            if(this.session_handler.hasSession()) {
                const time = settings.getWatchlistSettings().check_interval;
                if (new Date().getTime() - this.lastCheck > time * 60000 - 5000) {
                    this.checkUpdates();
                }

                this.watchLoop();
            } else {
                Log.verbose("Not logged in yet, skipping watchlist check.");
                this.watchLoop(5000);
            }
        }, interval);
    }
}
