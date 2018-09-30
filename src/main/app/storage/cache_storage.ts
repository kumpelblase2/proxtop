import Storage from "./storage";
import Low from "lowdb";
import Log from "../util/log";

const DB_NAME = 'cache';

export default class CacheStorage extends Storage {
    online = true;

    constructor(db: Low) {
        super(db, DB_NAME);
    }

    clearCache() {
        Log.info('Clearing response cache...');
        this.storage.remove().write();
    }

    getResponse(url) {
        Log.info("Return cached response for request to " + url);
        return this.storage.find({ url: url }).value();
    }

    cacheResponse(response) {
        const url = response.request.path;
        const body = response.body;
        this.online = true;
        if(this.storage.find({ url: url }).value()) {
            this.storage.find({ url: url }).assign({ body: body }).write();
        } else {
            this.storage.push({ url: url, body: body }).write();
        }

        return body;
    }
}
