const Storage = require('./storage');

const DB_NAME = 'cache';

class CacheStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }

    clearCache() {
        LOG.info('Clearing response cache...');
        this.storage.remove().write();
    }

    getResponse(url) {
        LOG.info("Return cached response for request to " + url);
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

module.exports = CacheStorage;
