const ipc = require('electron').ipcMain;
const _ = require('lodash');
const { Settings } = require('./storage');
const utils = require('./util/utils');

const DEFAULTS = {
    DEFAULT_ACCOUNT_SETTINGS: {
        type: 'account',
        keep_login: true,
        store_password: false,
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
        preferred_stream: 'proxer-stream'
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
        const capitalized = utils.capizalizeFirstLetter(setting);
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

ipc.on('settings', function(event, type, value) {
    const func = settings[(value ? 'set' : 'get') + utils.capizalizeFirstLetter(type) + 'Settings'];
    if(func) {
        event.returnValue = func(value);
    } else {
        event.returnValue = null;
    }
});

module.exports = settings;
