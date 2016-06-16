const Storage = require('./storage');

const DB_NAME = 'updater';

class UpdaterStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
        this.limited = this.storage.find({ name: 'limited' }).value();
        if(!this.limited) {
            this.limited = { value: false, release_time: 0, name: 'limited' };
            this.storage.push(this.limited).value();
        }
    }

    saveLimitation() {
        this.storage.find({ name: 'limited' }).assign(this.limited).value();
    }

    isLimited() {
        if(!this.limited || (this.limited && !this.limited.value)) {
            return false;
        }

        const isReleased = this.limited.release_time * 1000 < new Date().getTime();
        if(isReleased) {
            this.limited.value = false;
            this.limited.release_time = 0;
            LOG.silly("GitHub API limit release time reached; Resetting.");
            this.saveLimitation();
            return false;
        }

        return true;
    }

    setLimited(endTime) {
        this.limited.value = true;
        this.limited.release_time = endTime;
        LOG.silly("Set GitHub API release time to " + endTime);
    }
}

module.exports = UpdaterStorage;