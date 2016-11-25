const { IPCHandler, CacheControl } = require('../lib');

const WATCHLIST_CACHE_TIME = 60000; // 1 Minute

class Watchlist extends IPCHandler {
    constructor(watchlistHandler) {
        super();
        this.watchlist = watchlistHandler;
        this.watchlistCache = new CacheControl(WATCHLIST_CACHE_TIME, this.watchlist.loadWatchlist.bind(this.watchlist));
    }

    register() {
        this.provide('watchlist-update', () => this.watchlist.checkUpdates());
        this.handle('add-watchlist', this.watchlist.updateEntry, this.watchlist);
        this.handle('delete-watchlist', this.watchlist.deleteEntry, this.watchlist);
        this.handle('finish-watchlist', this.watchlist.markFinished, this.watchlist);
        this.handle('watchlist', this.watchlistCache.get, this.watchlistCache);

        const removeEntry = (event, entry) => {
            const value = this.watchlistCache.getIfFresh();
            if(!value) {
                return;
            }

            const filterFunc = (current) => {
                return current.entry !== entry;
            };

            value.anime = value.anime.filter(filterFunc);
            value.manga = value.manga.filter(filterFunc);
            this.watchlistCache.replace(value);
        };

        this.provide('finish-watchlist', removeEntry);
        this.provide('delete-watchlist', removeEntry);

        this.provide('clear-messages-cache', () => {
            this.watchlistCache.invalidate();
        });

        this.watchlist.watchLoop();
    }
}

module.exports = Watchlist;
