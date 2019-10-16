import db from "./db";

import SettingsStorage from "./settings_storage";
import UpdaterLimitStorage from "./update_storage";
import CacheStorage from "./cache_storage";
import MessagesCache from "./message_notification_storage";
import WatchlistCacheBackend from "./watchlist_storage";
import MessagesStorageBackend from "./message_storage";
import SessionStorageBackend from "./session_storage";

export const Cache = new CacheStorage(db);
export const Settings = new SettingsStorage(db);
export const GithubLimit = new UpdaterLimitStorage(db);
export const MessageReadCache = new MessagesCache(db);
export const MessagesStorage = new MessagesStorageBackend(db);
export const WatchlistCache = new WatchlistCacheBackend(db);
export const SessionStorage = new SessionStorageBackend(db);
