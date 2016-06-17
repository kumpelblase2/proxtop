const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const settings = require('./settings');


class Translation {
    constructor(translations) {
        this.translations = translations;
        this.fixed_language = null;
    }

    getAvailableLanguages() {
        return Object.keys(this.translations);
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

    setLanguage(lang) {
        this.fixed_language = lang;
    }

    getLanguage() {
        return this.fixed_language || settings.getGeneralSettings().language;
    }

    static load(options = { path: '../', prefix: 'locale-', suffix: '.json' }) {
        const translations = {};
        const files = fs.readdirSync(options.path);
        files.filter(f => {
            return f.startsWith(options.prefix) && f.endsWith(options.suffix)
        }).forEach(f => {
            const lang = f.substring(options.prefix.length, f.length - options.suffix.length);
            translations[lang] = JSON.parse(fs.readFileSync(path.join(options.path, f)));
        });

        return new Translation(translations);
    }
}

var latest;

var translate = () => {
    return latest;
};

translate.setup = (settings, options) => {
    latest = new Translation(settings, options);
    return latest;
};

translate.load = (options) => {
    latest = Translation.load(options);
    return latest;
};

module.exports = translate;
