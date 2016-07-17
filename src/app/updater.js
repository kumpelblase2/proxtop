const request = require('request-promise');
const utils = require('./util/utils');
const { GithubLimit } = require('./storage');
const { autoUpdater, ipcMain, app } = require('electron');
const os = require('os');

class GithubUpdater {
    constructor(feed) {
        this.check_url = feed;
        this.has_noticed = false;
        this.timer = null;
    }

    start(callback) {
        this.currentVersion = app.getVersion();
        this.callback = callback;
        setTimeout(() => {
            this.check();
        }, 1000);
    }

    stop() {
        clearTimeout(this.timer);
    }

    stopBothering() {
        this.has_noticed = true;
    }

    check() {
        const self = this;
        LOG.verbose('Running update check...');
        if(GithubLimit.isLimited()) {
            LOG.verbose("Still rate limited. Skipping.");
            return;
        }

        if(this.has_noticed) {
            LOG.verbose("User already knows, no need to check.");
            return;
        }

        request({
            url: self.check_url,
            headers: {
                'User-Agent': 'proxtop-' + this.currentVersion
            }
        }).then(JSON.parse).then(function(releases) {
            return utils.findLatestRelease(releases, self.currentVersion);
        }).then((update) => {
            LOG.verbose('Update available? ' + (update ? 'Yes' : 'No'));
            if(update) {
                self.callback({
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
        }).catch(function(e) {
            if(e.statusCode == 403) {
                LOG.warn("GitHub API limit reached.");
                GithubLimit.setLimited(parseInt(e.response.headers['x-ratelimit-reset']));
                GithubLimit.saveLimitation();
            } else {
                LOG.error("There was an issue doing github update check:", {
                    error: e
                });
            }
        });
    }
}

class AutoUpdater {
    constructor(feed) {
        autoUpdater.setFeedURL(feed);
        ipcMain.on('install_update', () => {
            autoUpdater.quitAndInstall();
        });
    }

    start(callback) {
        autoUpdater.on('update-downloaded', (event, notes, name, date) => {
            if(!notes || notes == null) {

            }

            callback({
                version: name,
                content: notes,
                date: date,
                success: {
                    type: 'restart'
                }
            });
        });

        LOG.verbose('Running update check...');
        // https://github.com/electron/electron/issues/4306
        if(process.argv[1] == '--squirrel-firstrun') {
            setTimeout(() => {
                autoUpdater.checkForUpdates();
            }, 15000);
        } else {
            autoUpdater.checkForUpdates();
        }
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
            const platform = os.platform() + "_" + os.arch();
            const version = app.getVersion();
            LOG.info("Auto update enabled.");
            return new AutoUpdater(UPDATER_FEED_URL + platform + "/" + version);
        default:
            LOG.info("Platform not supporting auto update. Falling back to github update.");
            return new GithubUpdater(GITHUB_RELEASES_URL);
    }
}

module.exports = getUpdater;
