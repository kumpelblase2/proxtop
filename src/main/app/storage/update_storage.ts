import Storage from "./storage";
import Log from "../util/log";
import Low from "lowdb";

const DB_NAME = 'updater';

type Limitation = {
    value: boolean,
    release_time: number,
    name: string
};

export default class UpdaterStorage extends Storage {
    limited: Limitation;

    constructor(db: Low) {
        super(db, DB_NAME);
        this.limited = this.storage.find({ name: 'limited' }).value();
        if(!this.limited) {
            this.limited = { value: false, release_time: 0, name: 'limited' };
            this.storage.push(this.limited).write();
        }
    }

    saveLimitation() {
        this.storage.find({ name: 'limited' }).assign(this.limited).write();
    }

    isLimited() {
        if(!this.limited || (this.limited && !this.limited.value)) {
            return false;
        }

        const isReleased = this.limited.release_time * 1000 < new Date().getTime();
        if(isReleased) {
            this.limited.value = false;
            this.limited.release_time = 0;
            Log.silly("GitHub API limit release time reached; Resetting.");
            this.saveLimitation();
            return false;
        }

        return true;
    }

    setLimited(endTime) {
        this.limited.value = true;
        this.limited.release_time = endTime;
        Log.silly("Set GitHub API release time to " + endTime);
    }
}
