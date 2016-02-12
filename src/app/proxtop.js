var Promise = require('bluebird');
var Settings = require('./settings');
var winston = require('winston');
var path = require("path");
var proxerapi = require('./proxerapi');
var api = require('./api');

function Proxtop() {
    this.baseURL = PROXER_BASE_URL;
}

Proxtop.prototype.init = function() {
    this.configPath = APP_DIR;
    this.api = new api();
    this.proxerapi = new proxerapi(path.join(this.configPath, 'cookies.json'));
    Proxtop.instance = this;
    return this.proxerapi.init().then(this.api.init.bind(this.api));
};

Proxtop.prototype.finish = function() {
};

module.exports = Proxtop;
