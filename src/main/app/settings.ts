import { ipcMain } from "electron";
import { capitalizeFirstLetter } from "./util/utils";
import { Settings as SettingsStorage } from "./storage";

export type Settings = {
    getAccountSettings(): AccountSettings;
    setAccountSettings(settings: AccountSettings);

    getAnimeSettings(): AnimeSettings;
    setAnimeSettings(settings: AnimeSettings);

    getWatchlistSettings(): WatchlistSettings;
    setWatchlistSettings(settings: WatchlistSettings);

    getGeneralSettings(): GeneralSettings;
    setGeneralSettings(settings: GeneralSettings);

    getMangaSettings(): MangaSettings;
    setMangaSettings(settings: MangaSettings);
};

export type AccountSettings = {
    keep_login: boolean,
    user: {
        username: string,
        password: string
    }
};

export type AnimeSettings = {
    open_with: string,
    external_path: string,
    pass_raw_url: boolean,
    preferred_stream: string,
    mark_next_episode: boolean,
    mark_next_episode_percent: number,
    automatically_start_next: boolean,
    time_before_next: number
};

export type MangaSettings = {
    open_with: string
}

export type WatchlistSettings = {
    check_interval: number,
    display_notification: boolean
}

export type LanguageSetting = 'de' | 'en'

export type GeneralSettings = {
    language: LanguageSetting,
    disable_user_agent: boolean,
    check_message_interval: number,
    message_notification: boolean,
    auto_update: boolean
}

const DEFAULTS = {
    DEFAULT_ACCOUNT_SETTINGS: {
        type: 'account',
        keep_login: true,
        user: {
            username: '',
            password: ''
        }
    },
    DEFAULT_ANIME_SETTINGS: {
        type: 'anime',
        open_with: 'system',
        external_path: 'proxer-mpv',
        pass_raw_url: true,
        preferred_stream: 'proxer-stream',
        mark_next_episode: false,
        mark_next_episode_percent: 100,
        automatically_start_next: true,
        time_before_next: 10
    },
    DEFAULT_WATCHLIST_SETTINGS: {
        type: 'watchlist',
        check_interval: 30,
        display_notification: true
    },
    DEFAULT_GENERAL_SETTINGS: {
        type: 'general',
        language: 'de',
        disable_user_agent: false,
        check_message_interval: 30,
        message_notification: true,
        auto_update: true
    },
    DEFAULT_MANGA_SETTINGS: {
        type: 'manga',
        open_with: 'system'
    }
};

// Might wanna do this with a loop or something
const settings: Settings = generateSettings([
    'account',
    'anime',
    'watchlist',
    'general',
    'manga'
]);

function generateSettings(allSettings): Settings {
    const result = {};

    allSettings.forEach((setting) => {
        const getterSetter = createGetterSetter(setting);
        const capitalized = capitalizeFirstLetter(setting);
        result['get' + capitalized + 'Settings'] = getterSetter.getter;
        result['set' + capitalized + 'Settings'] = getterSetter.setter;
    });

    // @ts-ignore
    return result;
}

function createGetterSetter(setting) {
    const uppercase = setting.toUpperCase();
    const globalVar = DEFAULTS['DEFAULT_' + uppercase + '_SETTINGS'];
    return {
        getter: function() {
            return SettingsStorage.get(setting, globalVar);
        },
        setter: function(value) {
            return SettingsStorage.set(setting, value);
        }
    };
}

ipcMain.on('settings', function(event, type, value) {
    const func = settings[(value ? 'set' : 'get') + capitalizeFirstLetter(type) + 'Settings'];
    if(func) {
        event.returnValue = func(value);
    } else {
        event.returnValue = null;
    }
});

export default settings;
