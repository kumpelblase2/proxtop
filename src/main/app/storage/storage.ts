import Low from "lowdb";

export default class Storage {
    db: Low;
    db_name: string;

    constructor(db: Low, name: string) {
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
