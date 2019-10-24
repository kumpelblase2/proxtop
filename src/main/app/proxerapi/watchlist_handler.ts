import { getOnlineDiff, OnlineEntry } from "../util/utils";
import { Instance as Notification } from "../notification";
import windowManager from "../ui/window_manager";
import settings from "../settings";
import Log from "../util/log";
import translate, { Translation } from "../translation";
import { WatchlistCache } from "../storage";
import { API_PATHS, LOGO_LOCATION, PROXER_API_BASE_URL } from "../globals";
import { whenLogin } from './wait_login';
import SessionHandler from "../lib/session_handler";

const returnMsg = (success, msg) => {
    return { success: success, msg: msg }
};

export type Watchlist = { anime: OnlineEntry[], manga: OnlineEntry[] }

function alterWatchlist(list): Watchlist {
    const result = { anime: [], manga: [] };

    list.map((entry) => {
        return {
            type: entry.kat,
            name: entry.name,
            status: entry.state,
            episode: entry.episode,
            entry: entry.id,
            sub: entry.language,
            id: entry.eid
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

const onlineFilter = entry => !!entry.status;

export default class WatchlistHandler {
    session_handler: SessionHandler;
    lastCheck = 0;
    translation: Translation = translate();

    constructor(sessionHandler: SessionHandler) {
        this.session_handler = sessionHandler;
    }

    apiLoadWatchlist(): Promise<Watchlist> {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.WATCHLIST.GET)
            .then((data) => data.data).then(alterWatchlist);
    }

    checkUpdates() {
        Log.info("Checking for new watchlist updates");
        this.lastCheck = new Date().getTime();
        this.apiLoadWatchlist().then((result) => {
            const old = WatchlistCache.getOldWatchlist();
            if(!old) {
                WatchlistCache.saveWatchlist(result);

                return {
                    first_load: true,
                    anime: result.anime.filter(onlineFilter),
                    manga: result.manga.filter(onlineFilter)
                };
            }

            const updates = { anime: null, manga: null, first_load: false };
            updates.anime = getOnlineDiff(old.anime, result.anime);
            updates.manga = getOnlineDiff(old.manga, result.manga);
            WatchlistCache.updateWatchlist(result);
            return updates;
        }).then((updates) => {
            if(!updates.first_load) {
                Object.keys(updates).forEach((type) => {
                    updates[type].forEach((update) => {
                        Log.verbose('Sending watchlist update for ' + update.name);
                        Notification.displayNotification({
                            title: 'Proxtop',
                            message: this.translation.get(`WATCHLIST.NEW_${type.toUpperCase()}`, { episode: update.episode, name: update.name }),
                            icon: LOGO_LOCATION
                        }, () => {
                            windowManager.notifyWindow('state-change', 'watch', {
                                id: update.id,
                                ep: update.episode,
                                sub: update.sub
                            });
                        });
                    });
                });
            }
        });
    }

    updateEntry(kat, id, episode, language) {
        Log.debug(`Updating entry with ID ${id} to episode ${episode}.`);
        return this.session_handler.openApiRequest((request) => {
            return request.post(
                PROXER_API_BASE_URL + API_PATHS.WATCHLIST.SET, {
                    form: {
                        id,
                        kat,
                        episode,
                        language
                    }
                }
            )
                ;
        }).then(() => returnMsg(true, "")).catch(() => returnMsg(false, "Not found"));
    }

    markFinished(category, id, ep, sub, entry) {
        const finishValue = parseInt(ep) + 1;
        Log.debug(`Marking anime with ID ${id} as finished. (Setting Episode value to ${finishValue})`);
        return this._findEntryFor(category, id, ep, sub).then(foundEntry => {
            if(foundEntry == null) {
                Log.debug("No comment entry found that's still on 'watching' so removing entry.");
                return this.deleteEntry(entry).then(() => returnMsg(true, ""));
            } else {
                return this.session_handler.openApiRequest((request) => {
                    return request.post(
                        PROXER_API_BASE_URL + API_PATHS.UCP.SET_COMMENT_STATE, {
                            form: {
                                id: foundEntry.cid,
                                value: parseInt(ep) + 1
                            }
                        });
                }).then(() => returnMsg(true, "")).catch(() => returnMsg(false, "Error?"));
            }
        })

    }

    _findEntryFor(category, id, ep, _sub, page = 0, limit = 100) {
        return this.session_handler.openApiRequest((request) => {
            return request.post(
                PROXER_API_BASE_URL + API_PATHS.UCP.ANIME_MANGA_LIST, {
                    form: {
                        kat: category,
                        p: page,
                        filter: 'stateFilter2',
                        limit
                    }
                });
        }).then(result => result.data).then(entries => {
            const foundEntry = entries.find(elem => elem.id == id && elem.episode == ep);
            if(foundEntry == null) {
                if(entries.length === limit) {
                    return this._findEntryFor(category, id, ep, _sub, page + 1)
                } else {
                    return null;
                }
            } else {
                return foundEntry;
            }
        });
    }

    deleteEntry(entry) {
        Log.debug(`Removing reminder with id ${entry}.`);
        return this.session_handler.openApiRequest((request) => {
            return request.post(
                PROXER_API_BASE_URL + API_PATHS.WATCHLIST.REMOVE, {
                    form: {
                        id: entry
                    }
                });
        }).then(() => ({ entry: entry }));
    }

    _startWatchLoop(interval) {
        this.checkUpdates();
        setInterval(() => {
            const time = settings.getWatchlistSettings().check_interval;
            if(new Date().getTime() - this.lastCheck > time * 60000 - 5000) {
                this.checkUpdates();
            }
        }, interval);
    }

    watchLoop(interval = 30000) {
        whenLogin().then(() => this._startWatchLoop(interval));
    }
}
