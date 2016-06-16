const _ = require('lodash');
const Storage = require('./storage');

const DB_NAME = 'settings';

class SettingsStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }
    
    get(key, defaults) {
        const result = this.storage.find({ type: key }).value();
        if(!result) {
            defaults.type = key;
            this.storage.push(defaults).value();
            return defaults;
        } else {
            return _.defaults(result, defaults);
        }
    }

    set(key, value) {
        return this.storage.find({ type: key }).assign(value).value();
    }
}

module.exports = SettingsStorage;