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
    return this.api.init();
};

Proxtop.prototype.finish = function() {
};

module.exports = Proxtop;
