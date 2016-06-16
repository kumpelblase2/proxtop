const db = require('./db');
const SettingsStorage = require('./settings_storage');
const UpdaterLimitStorage = require('./update_storage');
const CacheStorage = require('./cache_storage');
const MessagesCache = require('./messages_cache');
const WatchlistCache = require('./watchlist_storage');

module.exports = {
    Cache: new CacheStorage(db),
    Settings: new SettingsStorage(db),
    GithubLimit: new UpdaterLimitStorage(db),
    MessageCache: new MessagesCache(db),
    WatchlistCache: new WatchlistCache(db)
};
