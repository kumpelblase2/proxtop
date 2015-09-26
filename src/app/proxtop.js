var Promise = require('bluebird');
var Settings = require('./settings');
var winston = require('winston');
var path = require("path");
var api = require('./api');

function Proxtop() {
    this.baseURL = PROXER_BASE_URL;
}

Proxtop.prototype.init = function() {
    this.configPath = APP_DIR;
    this.api = new api(this);
    Proxtop.instance = this;

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
