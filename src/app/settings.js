var ipc = require('electron').ipcMain;
var Promise = require('bluebird');
var _ = require('lodash');
var db = require('./db');
var utils = require('./utils');

var DEFAULTS = {
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
        disable_user_agent: false
    },
    DEFAULT_MANGA_SETTINGS: {
        type: 'manga',
        open_with: 'system'
    }
};

// Might wanna do this with a loop or something
var settings = generateSettings([
    'account',
    'anime',
    'watchlist',
    'general',
    'manga'
]);

function generateSettings(allSettings) {
    var result = {};

    allSettings.forEach(function(setting) {
        var getterSetter = createGetterSetter(setting);
        var capitalized = utils.capizalizeFirstLetter(setting);
        result['get' + capitalized + 'Settings'] = getterSetter.getter;
        result['set' + capitalized + 'Settings'] = getterSetter.setter;
    });

    return result;
}

function createGetterSetter(setting) {
    var uppercase = setting.toUpperCase();
    var globalVar = DEFAULTS['DEFAULT_' + uppercase + '_SETTINGS'];
    return {
        getter: function() {
            var result = db('settings').find({ type: setting });
            if(!result) {
                db('settings').push(globalVar);
                return globalVar;
            } else {
                return result;
            }
        },
        setter: function(value) {
            return db('settings').chain().find({ type: setting }).merge(value).value();
        }
    };
}

ipc.on('settings', function(event, type, value) {
    var func = settings[(value ? 'set' : 'get') + utils.capizalizeFirstLetter(type) + 'Settings'];
    if(func) {
        event.returnValue = func(value);
    } else {
        event.returnValue = null;
    }
});

module.exports = settings;
