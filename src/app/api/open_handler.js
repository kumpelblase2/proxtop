const ipc = require('electron').ipcMain;
const childProcess = require('child_process');
const opener = require('opener');
const util = require('util');

class OpenHandler {
    constructor(settings) {
        this.settings = settings;
    }

    buildUrl(type, id, ep, sub) {
        const path = type === 'anime' ? PROXER_PATHS.WATCH_ANIME : PROXER_PATHS.VIEW_MANGA;
        sub = type === 'anime' ? sub : (sub == 'englisch' ? 'en' : 'de');
        return PROXER_BASE_URL + util.format(path, id, ep, sub);
    }

    open(type, id, ep, sub) {
        var openSettings;
        if(type == 'anime') {
            openSettings = this.settings.getAnimeSettings();
        } else {
            openSettings = this.settings.getMangaSettings();
        }

        const url = this.buildUrl(type, id, ep, sub);
        if(openSettings.open_with == 'external') {
            this.openExternal(type, url);
        } else if(openSettings.open_with == 'system') {
            opener(url);
        }
    }

    openExternal(type, url) {
        var openSettings;
        if(type == 'anime') {
            openSettings = this.settings.getAnimeSettings();
        } else {
            openSettings = this.settings.getMangaSettings();
        }

        LOG.info("Starting external application with url " + url);
        childProcess.execFile(openSettings.external_path, [url], function(err, stdout, stderr) {
            if(err) {
                LOG.error(err);
                return;
            }
            
            console.log(stderr);
        });
    }

    register() {
        ipc.on('open', (event, type, id, ep, sub) => {
            this.open(type, id, ep, sub);
        });

        ipc.on('open-external', (event, url) => {
            this.openExternal('anime', url);
        });

        ipc.on('open-link', (event, link) => {
            opener(link);
        });
    }
}

module.exports = OpenHandler;
