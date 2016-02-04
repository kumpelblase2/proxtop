var ipc = require('ipc');
var Promise = require('bluebird');
var _ = require('lodash');
var db = require('./db');
var utils = require('./utils');

var DEFAULT_ACCOUNT_SETTINGS = {
    type: 'account',
    keep_login: true,
    store_password: false,
    user: {
        username: '',
        password: ''
    }
};

var DEFAULT_ANIME_SETTINGS = {
    type: 'anime',
    open_with: 'system',
    external_path: 'proxer-mpv'
};

var DEFAULT_WATCHLIST_SETTINGS = {
    type: 'watchlist',
    check_interval: 30,
    display_notification: true
};

var DEFAULT_GENERAL_SETTINGS = {
    language: 'de',
    type: 'general'
};

var DEFAULT_MANGA_SETTINGS = {
    type: 'manga',
    open_with: 'system'
};

// Might wanna do this with a loop or something
var settings = {
    getAccountSettings: function() {
        var result = db('settings').find({ type: 'account' });
        if(!result) {
            db('settings').push(DEFAULT_ACCOUNT_SETTINGS);
            return DEFAULT_ACCOUNT_SETTINGS;
        } else {
            return result;
        }
    },
    setAccountSettings: function(settings) {
        return db('settings').chain().find({ type: 'account' }).merge(settings).value();
    },
    getAnimeSettings: function() {
        var result = db('settings').find({ type: 'anime' });
        if(!result) {
            db('settings').push(DEFAULT_ANIME_SETTINGS);
            return DEFAULT_ANIME_SETTINGS;
        } else {
            return result;
        }
    },
    setAnimeSettings: function(settings) {
        return db('settings').chain().find({ type: 'anime' }).merge(settings).value();
    },
    getWatchlistSettings: function() {
        var result = db('settings').find({ type: 'watchlist' });
        if(!result) {
            db('settings').push(DEFAULT_WATCHLIST_SETTINGS);
            return DEFAULT_WATCHLIST_SETTINGS;
        } else {
            return result;
        }
    },
    setWatchlistSettings: function(settings) {
        return db('settings').chain().find({ type: 'watchlist' }).merge(settings).value();
    },
    getGeneralSettings: function() {
        var result = db('settings').find({ type: 'general' });
        if(!result) {
            db('settings').push(DEFAULT_GENERAL_SETTINGS);
            return DEFAULT_GENERAL_SETTINGS;
        } else {
            return result;
        }
    },
    setGeneralSettings: function(settings) {
        return db('settings').chain().find({ type: 'general' }).merge(settings).value();
    },
    getMangaSettings: function() {
        var result = db('settings').find({ type: 'manga' });
        if(!result) {
            db('settings').push(DEFAULT_MANGA_SETTINGS);
            return DEFAULT_MANGA_SETTINGS;
        } else {
            return result;
        }
    },
    setMangaSettings: function(settings) {
        return db('settings').chain().find({ type: 'manga' }).merge(settings).value();
    }
};

ipc.on('settings', function(event, type, value) {
    var func = settings[(value ? 'set' : 'get') + utils.capizalizeFirstLetter(type) + 'Settings'];
    if(func) {
        event.returnValue = func(value);
    } else {
        event.returnValue = null;
    }
});

module.exports = settings;
