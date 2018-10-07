import { ipcMain } from "electron";
import { capitalizeFirstLetter } from "./util/utils";
import { Settings } from "./storage";

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
        language: 'de',
        type: 'general',
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
const settings = generateSettings([
    'account',
    'anime',
    'watchlist',
    'general',
    'manga'
]);

function generateSettings(allSettings) {
    const result = {};

    allSettings.forEach((setting) => {
        const getterSetter = createGetterSetter(setting);
        const capitalized = capitalizeFirstLetter(setting);
        result['get' + capitalized + 'Settings'] = getterSetter.getter;
        result['set' + capitalized + 'Settings'] = getterSetter.setter;
    });

    return result;
}

function createGetterSetter(setting) {
    const uppercase = setting.toUpperCase();
    const globalVar = DEFAULTS['DEFAULT_' + uppercase + '_SETTINGS'];
    return {
        getter: function() {
            return Settings.get(setting, globalVar);
        },
        setter: function(value) {
            return Settings.set(setting, value);
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
