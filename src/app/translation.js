const path = require('path');
const fs = require('fs');
const _ = require('lodash');

class Translation {
    constructor(settings, translations) {
        this.settings = settings;
        this.translations = translations;
    }

    get(key, params = {}) {
        const lang = this.getLanguage();
        let value = this.translations[lang];
        if(!value) {
            return null;
        }

        value = _.get(value, key);

        for(var param of Object.keys(params)) {
            value = value.replace(`{{${param}}}`, params[param]);
        }

        return value;
    }

    getLanguage() {
        return this.settings.getGeneralSettings().language;
    }

    static load(settings, options = { path: '../', prefix: 'locale-', suffix: '.json' }) {
        const translations = {};
        fs.readdir(options.path, (err, files) => {
            files.filter(f => {
                return f.startsWith(options.prefix) && f.endsWith(options.suffix)
            }).forEach(f => {
                let lang = f.substring(options.prefix.length, f.length - options.suffix.length);
                translations[lang] = JSON.parse(fs.readFileSync(path.join(options.path, f)));
            });
        });

        return new Translation(translations);
    }
}

var latest;

var translate = function() {
    return latest;
}

translate.setup = function(settings, options) {
    latest = new Translation(settings, options);
}

module.exports = translate;
