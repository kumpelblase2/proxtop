const IPCHandler = require('../lib/ipc_handler');
const CacheControl = require('../lib/cache_control');

const WATCHLIST_CACHE_TIME = 60000;

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
        this.watchlist.watchLoop();
    }
}

module.exports = Watchlist;