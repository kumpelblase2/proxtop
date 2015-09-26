var app = require('app');
var ipc = require('ipc');
var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require("fs"));
var _ = require('lodash');

var settings = {};

var DEFAULT_CONFIG = {
    store_password: false,
    logged_in: false,
    user: {
        username: "",
        password: ""
    }
};

settings.read = function(inString) {
    var self = this;
    return Promise.resolve(inString).then(function(configString) {
        return JSON.parse(configString);
    }).then(function(json) {
        self.settings = _.defaultsDeep(json, DEFAULT_CONFIG);
        LOG.info("Read config.");
        return self;
    });
};

settings.load = function(inPath, inDefault) {
    if(!inDefault) {
        inDefault = DEFAULT_CONFIG;
    }

    var self = this;
    return fs.readFileAsync(getSettingsPath(inPath))
        .then(this.read.bind(this))
        .catch(SyntaxError, function(e) {
            LOG.warn("Found invalid config syntax, opting to default");
            self.settings = inDefault;
            return self;
        })
        .catch(function(e) {
            if(e.code && e.code === "ENOENT") {
                LOG.warn("Settings file not found, using defaults.");
            } else {
                LOG.warn("There was an issue reading settings:");
                LOG.warn(e);
            }
            self.settings = inDefault;
            return self;
        });
};

settings.getSettings = function() {
    return this.settings;
};

settings.serialize = function() {
    return Promise.resolve(this.getSettings()).then(function(settings) {
        return JSON.stringify(settings);
    });
};

settings.write = function(inPath) {
    if(this.settings == null) {
        this.settings = DEFAULT_CONFIG;
    }

    return Promise.resolve().then(this.serialize.bind(this)).then(function(settings) {
        LOG.verbose("Saving " + settings);
        return fs.writeFile(getSettingsPath(inPath), settings);
    });
};

function getSettingsPath(inBase) {
    return path.join(inBase, "settings.json");
}

ipc.on('settings', function(event, type, value) {
    if(type === "get") {
        LOG.verbose("Providing settings.");
        event.returnValue = settings.getSettings();
    } else {
        LOG.verbose('Settings new settings.');
        settings.settings = value;
    }
});

module.exports = settings;
