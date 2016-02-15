var Promise = require('bluebird');
var Settings = require('./settings');
var winston = require('winston');
var path = require("path");
var proxerapi = require('./proxerapi');
var api = require('./api');
var packageInfo = require('../../package.json');
var Updater = require('./updater');

var UPDATE_INTERVALL = 2 * 60 * 60 * 1000;

function Proxtop(onUpdate) {
    this.baseURL = PROXER_BASE_URL;
    this.updater = new Updater(onUpdate, packageInfo.version);
}

Proxtop.prototype.init = function() {
    this.configPath = APP_DIR;
    this.api = new api();
    this.proxerapi = new proxerapi(path.join(this.configPath, 'cookies.json'));
    Proxtop.instance = this;
    this.updater.run();
    this.updateLoop();
    return this.proxerapi.init().then(this.api.init.bind(this.api));
};

Proxtop.prototype.updateLoop = function() {
    var self = this;
    setTimeout(function() {
        self.updater.check();
        self.updateLoop();
    }, UPDATE_INTERVALL);
};

Proxtop.prototype.finish = function() {
};

module.exports = Proxtop;
