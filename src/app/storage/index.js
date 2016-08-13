const db = require('./db');
const SettingsStorage = require('./settings_storage');
const UpdaterLimitStorage = require('./update_storage');
const CacheStorage = require('./cache_storage');
const MessagesCache = require('./message_notification_storage');
const WatchlistCache = require('./watchlist_storage');
const MessagesStorage = require('./message_storage');

module.exports = {
    Cache: new CacheStorage(db),
    Settings: new SettingsStorage(db),
    GithubLimit: new UpdaterLimitStorage(db),
    MessageReadCache: new MessagesCache(db),
    MessagesStorage: new MessagesStorage(db),
    WatchlistCache: new WatchlistCache(db)
};
