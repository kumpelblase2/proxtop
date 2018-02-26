import Storage from "./storage";
import Low from "lowdb";
import * as _ from "lodash";

const DB_NAME = 'settings';

export default class SettingsStorage extends Storage {
    constructor(db: Low) {
        super(db, DB_NAME);
    }
    
    get(key: string, defaults) {
        const result = this.storage.find({ type: key }).value();
        if(!result) {
            defaults.type = key;
            this.storage.push(defaults).write();
            return defaults;
        } else {
            return _.defaults(result, defaults);
        }
    }

    set(key, value) {
        return this.storage.find({ type: key }).assign(value).write();
    }
}
