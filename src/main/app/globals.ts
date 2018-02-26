import * as path from 'path';

export const UPDATE_INTERVALL = 2 * 60 * 60 * 1000;
export const GITHUB_RELEASES_URL = "https://api.github.com/repos/kumpelblase2/proxtop/releases";
export const UPDATER_FEED_URL = "https://proxtop.eternalwings.de/update/";

export const APP_NAME = "proxtop";
export const PROXER_BASE_URL = "https://proxer.me";
export const PROXER_API_BASE_URL = "https://proxer.me/api/v1";
export const INDEX_LOCATION = __dirname + "/index.html";
export const LOGO_RELATIVE_PATH = "static/assets/proxtop_logo_256.png";
export const LOGO_LOCATION = path.join(__dirname, "../", LOGO_RELATIVE_PATH);

let appDir: string;
try {
    appDir = path.join(require("electron").app.getPath("appData"), APP_NAME);
} catch (e) {
    appDir = path.join(__dirname, '..', '..', APP_NAME);
}
export const APP_DIR = appDir;

export const PROXER_PATHS = {
    ROOT: '/',
    LOGIN: '/component/user/?task=user.login',
    API_LOGIN: '/login?format=json&action=login',
    WATCHLIST: '/ucp?s=reminder',
    OWN_PROFILE: '/user',
    NEWS: '/news',
    NEWS_API: '/notifications?format=json&s=news&p=1',
    CONVERSATIONS_API: '/messages/?format=json&json=conferences',
    CONVERSATION_PAGE: '/messages/?id=',
    CONVERSATION_FAVORITES: '/messages/favourite',
    CONVERSATION_MARK_FAVORITE: '/messages/?format=json&json=favour&id=',
    CONVERSATION_UNMARK_FAVORITE: '/messages/?format=json&json=unfavour&id=',
    CONVERSATION_MARK_BLOCKED: '/messages/?format=json&json=block&id=',
    CONVERSATION_UNMARK_BLOCKED: '/messages/?format=json&json=unblock&id=',
    CONVERSATION_REPORT: '/messages/?s=report&format=raw&id=',
    CONVERSATION_NEW_CONFERENCE: "/messages/?format=json&json=newConference",
    CONVERSATION_NEW: "/messages/?format=json&json=new",
    MESSAGE_API: '/messages/?format=json&json=messages&id=',
    MESSAGE_NEW_API: '/messages/?format=json&json=newmessages&id=',
    MESSAGE_WRITE_API: '/messages/?format=json&json=answer&id=',
    MESSAGE_NOTIFICATIONS: '/messages?format=raw&s=notification',
    WATCH_ANIME: '/watch/%d/%d/%s',
    VIEW_MANGA: '/chapter/%d/%d/%s',
    LOGOUT: '/component/users/?task=user.logout',
    DELETE_WATCHLIST: '/ucp?format=json&type=deleteReminder&id='
};

export const API_PATHS = {
    USER: {
        LOGIN: "/user/login",
        LOGOUT: "/user/logout",
        PROFILE: "/user/userinfo"
    },
    WATCHLIST: {
        GET: "/ucp/reminder",
        REMOVE: "/ucp/deletereminder",
        SET: "/ucp/setreminder",
        SET_EPISODE: "/ucp/setcommentstate"
    },
    ANIME: {
        UPDATE_STATUS: "/info/setuserinfo"
    },
    QUERY: {
        USERS: "/user/list",
        SEARCH: "/list/entrysearch",
    },
    MESSAGES: {
        CONSTANTS: "/messenger/constants",
        CONFERENCES: "/messenger/conferences",
        CONFERENCE_INFO: "/messenger/conferenceinfo",
        MESSAGES: "/messenger/messages",
        WRITE_MESSAGE: "/messenger/setmessage",
        NEW_CONVERSATION: "/messenger/newconference",
        NEW_CONFERENCE: "/messenger/newconferencegroup",
        REPORT: "/messenger/report",
        MARK_READ: "/messenger/setread",
        MARK_UNREAD: "/messenger/setunread",
        BLOCK: "/messenger/setblock",
        UNBLOCK: "/messenger/setunblock",
        FAVORITE: "/messenger/setfavour",
        UNFAVORITE: "/messenger/setunfavour"
    },
    NOTIFICATIONS: {
        NEWS: "/notifications/news",
        AMOUNT: "/notifications/count",
        CLEAR: "/notifications/delete"
    },
    UCP: {
        ANIME_MANGA_LIST: "/ucp/list"
    }
};

export const Errors = {
    CONNECTION: {
        NO_NETWORK: 'ERROR.CONNECTION_NO_NETWORK',
        UNABLE_TO_RESOLVE: 'ERROR.CONNECTION_NO_RESOLVE',
        TIMEOUT: 'ERROR.CONNECTION_TIMEOUT',
        NOT_FOUND: 'ERROR.CONNECTION_NOT_FOUND',
        NO_CACHE: 'ERROR.CONNECTION_NO_CACHE_AVAILABLE',
        NETWORK_RECONNECT: 'ERROR.CONNECTION_RECONNECT'
    },
    PROXER: {
        OFFLINE: 'ERROR.PROXER_OFFLINE',
        INVALID_CREDENTIALS: 'ERROR.PROXER_INVALID_CREDENTIALS',
        NO_DETAILS_PROVIDED: 'ERROR.PROXER_NO_DETAILS',
        MYSQL_DOWN: 'ERROR.PROXER_MYSQL_ERROR',
        CLOUDFLARE: 'ERROR.PROXER_CLOUDFLARE_PROTECTION',
        API_LIMIT_REACHED: 'ERROR.PROXER_API_LIMIT'
    },
    STREAMS: {
        CANNOT_PARSE: 'ERROR.STREAM_NO_PARSER'
    },
    OTHER: {
        UNKNOWN: 'ERROR.UNKNOWN_ERROR',
        CACHE_CLEAR: 'ERROR.CACHE_CLEAR'
    },
    SEVERITY: {
        SEVERE: 'ERROR_SEVERITY.severe',
        WARNING: 'ERROR_SEVERITY.warn',
        INFO: 'ERROR_SEVERITY.info'
    }
};
