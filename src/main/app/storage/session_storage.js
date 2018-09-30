import Storage from "./storage";
import Log from "../util/log";

const DB_NAME = "session";
const HOUR_IN_MS = 1000 * 60 * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;
const MINIMAL_VALID_TIME = DAY_IN_MS * 7;
const MAX_TIME_AFTER_CREATION = DAY_IN_MS * 30;
const MAX_TIME_IN_USE_AFTER_EXPIRY = HOUR_IN_MS;

export default class SessionStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }

    hasValidSession() {
        const data = this._getSessionData();
        if(!data) {
            Log.debug("No session available");
            return false;
        }

        const currentTime = Date.now();
        if(data.created + MINIMAL_VALID_TIME > currentTime) { // Last used at least within 7 days, so we're already good
            return true;
        }

        if(data.lastUsed + MINIMAL_VALID_TIME > currentTime) { // Since it's not created 7 days ago, we have to at least check if it was used in the last 7 days
            return data.created + MAX_TIME_AFTER_CREATION > currentTime || data.lastUsed + MAX_TIME_IN_USE_AFTER_EXPIRY > currentTime;
        } else {
            this.invalidateSession(); // To make it easier for next tries
            return false;
        }
    }

    invalidateSession() {
        Log.debug("Invalidating session.");
        this.storage.remove().write();
    }

    refreshSession() {
        const data = this._getSessionData();
        if(data) {
            data.lastUsed = Date.now();
            this._updateSession(data);
        } else {
            Log.warn("Refreshing empty session!");
        }
    }

    _updateSession(session) {
        this.storage.remove().write();
        this.storage.push(session).write();
    }

    startSession(token, uid, avatar) {
        Log.debug("Got new session");
        this._updateSession({
            token,
            uid,
            avatar,
            created: Date.now(),
            lastUsed: Date.now()
        });
    }

    getSession() {
        return this._getSessionData();
    }

    _getSessionData() {
        return this.storage.find({}).value();
    }
}
