const tough = require('tough-cookie');
const { MemoryCookieStore } = require('tough-cookie/lib/memstore');
const fs = require('fs');

function iterateProperties(obj, cb) {
    for(let elem in obj) {
        if(obj.hasOwnProperty(elem)) {
            cb(elem, obj[elem])
        }
    }
}

class FileStore extends MemoryCookieStore {
    constructor(file) {
        super();
        this.file = file;
        this.load();
    }

    createSaveCallback(callback) {
        return (err) => {
            if(err) {
                callback(err);
            } else {
                this.save(callback);
            }
        };
    }

    putCookie(cookie, callback) {
        super.putCookie(cookie, this.createSaveCallback(callback));
    }

    removeCookie(domain, path, key, callback) {
        super.removeCookie(domain, path, key, this.createSaveCallback(callback));
    }

    removeCookies(domain, path, callback) {
        super.removeCookies(domain, path, this.createSaveCallback(callback));
    }

    load() {
        const data = fs.readFileSync(this.file, 'utf8');
        let json = data ? JSON.parse(data) : {};
        iterateProperties(json, (domain, paths) => {
            iterateProperties(paths, (path, cookies) => {
                iterateProperties(cookies, (cookieName, cookie) => {
                    json[domain][path][cookieName] = tough.fromJSON(JSON.stringify(cookie));
                });
            });
        });

        this.idx = json;
    }

    save(callback) {
        const data = JSON.stringify(this.idx);
        fs.writeFile(this.file, data, (err) => {
            if(err) {
                throw err;
            } else {
                callback();
            }
        });
    }
}

module.exports = FileStore;