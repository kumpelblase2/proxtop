const request = require('request-promise');
const utils = require('./util/utils');
const { GithubLimit } = require('./storage');
const { autoUpdater, ipcMain, app } = require('electron');
const os = require('os');
const translation = require('./translation');
const settings = require('./settings');

class GithubUpdater {
    constructor(feed) {
        this.check_url = feed;
        this.has_noticed = false;
        this.timer = null;
        ipcMain.on('check-update', () => {
            this.check();
        });

        ipcMain.on('stop-update', () => {
            this.stop();
        });
    }

    start(callback) {
        this.currentVersion = app.getVersion();
        this.callback = callback;
        if(settings.getGeneralSettings().auto_update) {
            this.timer = setTimeout(() => {
                this.check();
            }, 1000);
        }
    }

    stop() {
        clearTimeout(this.timer);
    }

    stopBothering() {
        this.has_noticed = true;
    }

    check() {
        LOG.info('Running update check...');
        if(GithubLimit.isLimited()) {
            LOG.verbose("Still rate limited. Skipping.");
            return;
        }

        if(this.has_noticed) {
            LOG.verbose("User already knows, no need to check.");
            return;
        }

        request({
            url: this.check_url,
            headers: {
                'User-Agent': 'proxtop-' + this.currentVersion
            }
        }).then(JSON.parse).then((releases) => {
            return utils.findLatestRelease(releases, this.currentVersion);
        }).then((update) => {
            LOG.verbose('Update available? ' + (update ? 'Yes' : 'No'));
            if(update) {
                LOG.info("Update is available, notifying user.");
                this.callback({
                    version: update.tag_name + " - " + update.name,
                    content: update.body,
                    date: new Date(update.published_at),
                    success: {
                        type: 'open_url',
                        value: update.html_url
                    }
                });
                this.stopBothering();
            }
        }).then(() => {
            this.timer = setTimeout(() => {
                this.check();
            }, UPDATE_INTERVALL);
        }).catch((e) => {
            if(e.statusCode == 403) {
                LOG.warn("GitHub API limit reached.");
                GithubLimit.setLimited(parseInt(e.response.headers['x-ratelimit-reset']));
                GithubLimit.saveLimitation();
            } else {
                LOG.error("There was an issue doing github update check:", e);
            }
        });
    }
}

class AutoUpdater {
    constructor(feed) {
        this.translate = translation();
        autoUpdater.setFeedURL(feed);
        ipcMain.on('install-update', () => {
            autoUpdater.quitAndInstall();
        });

        ipcMain.on('check-update', () => {
            autoUpdater.checkForUpdates();
        });
    }

    start(callback) {
        autoUpdater.on('update-downloaded', (event, notes, name, date) => {
            LOG.info("Update ready, notifiying user.");
            notes = notes || this.translate.get('UPDATE.WINDOWS_UPDATE_TEXT');
            date = date || new Date();

            callback({
                version: name,
                content: notes,
                date: date,
                success: {
                    type: 'restart'
                }
            });
        });

        autoUpdater.on('update-available', () => {
            LOG.info('New update found, downloading.');
        });

        if(!settings.getGeneralSettings().auto_update) {
            return;
        }

        LOG.verbose('Running update check...');
        autoUpdater.checkForUpdates();
    }

    stop() {
    }

    stopBothering() {
    }
}

function getUpdater() {
    switch(os.platform()) {
        // case 'darwin': Currently not support since it requires code signing
        case 'win32':
            const platform = os.platform();
            const version = app.getVersion();
            LOG.info("Auto update enabled.");
            return new AutoUpdater(UPDATER_FEED_URL + platform + "/" + version);
        default:
            LOG.info("Platform not supporting auto update. Falling back to github update.");
            return new GithubUpdater(GITHUB_RELEASES_URL);
    }
}

module.exports = getUpdater;
