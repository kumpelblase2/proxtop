import Logger from './util/log';
import { GITHUB_RELEASES_URL, UPDATE_INTERVALL, UPDATER_FEED_URL } from './globals';
import * as request from 'request-promise';
import translation from "./translation";
import { findLatestRelease } from "./util/utils";
import * as os from "os";
import settings from "./settings";
import { GithubLimit } from "./storage";

const { autoUpdater, ipcMain, app } = require('electron');

export interface VersionInformation {
    version: string,
    content: string,
    date: Date,
    success: {
        type: string,
        value: string
    }
}

export type UpdateCallback = (VersionInformation) => any;

export interface Updater {
    feed: string,

    start(callback: UpdateCallback),

    stop(),

    stopBothering()
}

class GithubUpdater implements Updater {
    hasNoticed = false;
    timer?: NodeJS.Timer;
    currentVersion?: string;
    callback?: UpdateCallback;

    constructor(public feed: string) {
        ipcMain.on('check-update', () => {
            this.check();
        });

        ipcMain.on('stop-update', () => {
            this.stop();
        });
    }

    start(callback: UpdateCallback) {
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
        this.hasNoticed = true;
    }

    private check() {
        Logger.info('Running update check...');
        if(GithubLimit.isLimited()) {
            Logger.verbose("Still rate limited. Skipping.");
            return;
        }

        if(this.hasNoticed) {
            Logger.verbose("User already knows, no need to check.");
            return;
        }

        request({
            url: this.feed,
            headers: {
                'User-Agent': 'proxtop-' + this.currentVersion
            }
        }).then(JSON.parse).then((releases) => {
            return findLatestRelease(releases, this.currentVersion);
        }).then((update) => {
            Logger.verbose('Update available? ' + (update ? 'Yes' : 'No'));
            if(update) {
                Logger.info("Update is available, notifying user.");
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
                Logger.warn("GitHub API limit reached.");
                GithubLimit.setLimited(parseInt(e.response.headers['x-ratelimit-reset']));
                GithubLimit.saveLimitation();
            } else {
                Logger.error("There was an issue doing github update check:", e);
            }
        });
    }
}

class AutoUpdater implements Updater {
    translate = translation();

    constructor(public feed: string) {
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
            Logger.info("Update ready, notifying user.");
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
            Logger.info('New update found, downloading.');
        });

        if(!settings.getGeneralSettings().auto_update) {
            return;
        }

        Logger.verbose('Running update check...');
        autoUpdater.checkForUpdates();
    }

    stop() {
    }

    stopBothering() {
    }
}

export default function updater() {
    const platform = os.platform();
    switch(platform) {
        // case 'darwin': Currently not support since it requires code signing
        case 'win32':
            const version = app.getVersion();
            Logger.info("Auto update enabled.");
            return new AutoUpdater(UPDATER_FEED_URL + platform + "/" + version);
        default:
            Logger.info("Platform not supporting auto update. Falling back to github update.");
            return new GithubUpdater(GITHUB_RELEASES_URL);
    }
}
