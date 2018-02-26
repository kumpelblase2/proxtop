import { readFileSync, writeFile } from "fs";
import Log from "../util/log";
import { fromJSON } from "tough-cookie";
import { MemoryCookieStore } from "tough-cookie/lib/memstore";


function iterateProperties(obj: object, cb) {
    for(let elem in obj) {
        if(obj.hasOwnProperty(elem)) {
            cb(elem, obj[elem])
        }
    }
}

export default class FileStore extends MemoryCookieStore {
    file: string;
    jsonData: any;
    constructor(file) {
        super();
        this.file = file;
        this.load();
    }

    createSaveCallback(callback: (err?: any) => void) {
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
        const data = readFileSync(this.file, 'utf8');
        if (data.length >= 2) {
            if (data[0] === '{' && data[data.length - 1] === '}') {
                try {
                    let json = data && data.length > 0 ? JSON.parse(data) : {};
                    iterateProperties(json, (domain, paths) => {
                        iterateProperties(paths, (path, cookies) => {
                            iterateProperties(cookies, (cookieName, cookie) => {
                                json[domain][path][cookieName] = fromJSON(JSON.stringify(cookie));
                            });
                        });
                    });

                    this.jsonData = json;
                } catch (exception) {
                    Log.error("Error reading cookies: " + exception);
                    this.jsonData = {};
                }
            } else {
                Log.warn("Encountered old cookies. Ignoring.");
                this.jsonData = {};
                this.save(() => {
                });
            }
        } else {
            this.jsonData = {};
        }
    }

    save(callback: () => void) {
        const data = JSON.stringify(this.jsonData);
        writeFile(this.file, data, (err) => {
            if(err) {
                throw err;
            } else {
                callback();
            }
        });
    }
}
