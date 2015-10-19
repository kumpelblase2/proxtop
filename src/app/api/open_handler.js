var ipc = require('ipc');
var shell = require('shell');
var util = require('util');

function OpenHandler() {
    this.settings = require('../settings');
}

OpenHandler.prototype.buildUrl = function(type, id, ep, sub) {
    var path = type === 'anime' ? PROXER_PATHS.WATCH_ANIME : PROXER_PATHS.VIEW_MANGA;
    return PROXER_BASE_URL + util.format(path, id, ep, sub);
};

OpenHandler.prototype.open = function(type, id, ep, sub) {
    var openSettings;
    if(type == 'anime') {
        openSettings = this.settings.getAnimeSettings();
    } else {
        openSettings = this.settings.getMangaSettings();
    }

    var url = this.buildUrl(type, id, ep, sub);
    if(openSettings.open_with == 'external') {
        shell.exec([openSettings.external_path, url]);
    } else if(openSettings.open_with == 'browser') {
        shell.openExternal(url);
    }
};

OpenHandler.prototype.register = function() {
    var self = this;
    ipc.on('open', function(event, type, id, ep, sub) {
        self.open(type, id, ep, sub);
    });
};

module.exports = OpenHandler;
