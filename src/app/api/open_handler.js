var ipc = require('ipc');
var childProcess = require('child_process');
var opener = require('opener');
var util = require('util');

function OpenHandler() {
    this.settings = require('../settings');
}

OpenHandler.prototype.buildUrl = function(type, id, ep, sub) {
    var path = type === 'anime' ? PROXER_PATHS.WATCH_ANIME : PROXER_PATHS.VIEW_MANGA;
    sub = type === 'anime' ? sub : (sub == 'englisch' ? 'en' : 'de');
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
        childProcess.execFile(openSettings.external_path, [url], function(err, stdout, stderr) {
            if(err) {
                console.log("error spawning command.");
                return;
            }

            console.log(stdout);
            console.log(stderr);
        });
    } else if(openSettings.open_with == 'system') {
        opener(url);
    }
};

OpenHandler.prototype.register = function() {
    var self = this;
    ipc.on('open', function(event, type, id, ep, sub) {
        self.open(type, id, ep, sub);
    });
};

module.exports = OpenHandler;
