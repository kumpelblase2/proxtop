import { get as getByPath } from "lodash";
import settings, { LanguageSetting } from "./settings";

export class Translation {
    fixed_language?: LanguageSetting = null;
    translations: { [language: string]: object };

    constructor(translations) {
        this.translations = translations;
    }

    getAvailableLanguages(): Array<string> {
        if(this.translations) {
            return Object.keys(this.translations);
        } else {
            return [];
        }
    }

    get(key: string, params: { [key: string]: string } = {}): string {
        const lang = this.getLanguage();
        let languageValues = this.translations[lang];
        if(!languageValues) {
            return null;
        }

        let value = getByPath(languageValues, key);

        for(let param of Object.keys(params)) {
            value = value.replace(`{{${param}}}`, params[param]);
        }

        return value;
    }

    setLanguage(lang: LanguageSetting) {
        this.fixed_language = lang;
    }

    getLanguage(): LanguageSetting {
        return this.fixed_language || settings.getGeneralSettings().language;
    }
}

let latest: Translation;

export default function get(): Translation {
    return latest;
}

export function setup(translations) {
    latest = new Translation(translations);
    return latest;
}
