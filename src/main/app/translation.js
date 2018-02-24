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
        if(this.translations) {
            return Object.keys(this.translations);
        } else {
            return [];
        }
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
}

var latest;

var translate = () => {
    return latest;
};

translate.setup = (translations) => {
    latest = new Translation(translations);
    return latest;
};

module.exports = translate;
