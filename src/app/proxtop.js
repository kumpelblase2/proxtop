var Promise = require('bluebird');
var Settings = require('./settings');
var winston = require('winston');
var path = require("path");
var logger = require('./logger');
var api = require('./api');

var PROXER_BASE_URL = 'https://proxer.me/';

function Proxtop() {
    this.log = logger;
    this.baseURL = PROXER_BASE_URL;
}

Proxtop.prototype.init = function(inConfigPath) {
    this.configPath = inConfigPath;
    this.api = new api(this);
    Proxtop.instance = this;
    var logFile = path.join(this.configPath, "app.log");
    console.log('Setting logfile to ' + logFile);
    this.log.add(winston.transports.File, {
        filename: logFile
    });

    var self = this;
    return this.loadSettings().then(this.saveSettings.bind(this)).then(function() {
        return self.api.init();
    });
};

Proxtop.prototype.finish = function() {
    return this.saveSettings();
};

Proxtop.prototype.loadSettings = function() {
    var self = this;
    return Settings.load(this.configPath).then(function(loaded) {
        self.settings = loaded;
    });
};

Proxtop.prototype.saveSettings = function() {
    return Settings.write(this.configPath);
};

module.exports = Proxtop;
