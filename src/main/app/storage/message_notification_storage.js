const Storage = require('./storage');

const DB_NAME = 'messages-cache';

class MessageReceivedStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }

    clear() {
        this.storage.remove();
    }

    hasReceived(user) {
        return this.storage.find({ username: user }).value();
    }

    markReceived(user) {
        this.storage.push({ username: user }).write();
    }
}

module.exports = MessageReceivedStorage;
