class Storage {
    constructor(db, name) {
        this.db = db;
        this.db_name = name;
        if(!this.db.has(name).value()) {
            this.db.set(name, []).write();
        }
    }

    get storage() {
        return this.db.get(this.db_name);
    }
}

module.exports = Storage;
