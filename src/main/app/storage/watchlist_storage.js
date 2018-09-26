const Storage = require('./storage');

const DB_NAME = 'watchlist-cache';

class WatchlistStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }

    getOldWatchlist() {
        return this.storage.find({ type: 'watchlist-cache' }).value();
    }

    saveWatchlist(watchlist) {
        console.log("writing watchlist");
        this.storage.remove().write(); // Is this write necessary?
        this.storage.push({
            type: 'watchlist-cache',
            anime: watchlist.anime,
            manga: watchlist.manga
        }).write();
    }
    
    updateWatchlist(watchlist) {
        this.storage.find({ type: 'watchlist-cache' }).assign({ anime: watchlist.anime, manga: watchlist.manga }).write();
    }
}

module.exports = WatchlistStorage;
