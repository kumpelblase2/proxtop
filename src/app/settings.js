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
}

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
