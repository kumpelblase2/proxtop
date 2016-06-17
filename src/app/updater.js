const request = require('request-promise');
const _ = require('lodash');
const utils = require('./util/utils');
const { GithubLimit } = require('./storage');

class Updater {
    constructor(check_url) {
        this.check_url = check_url;
        this.has_noticed = false;
        this.timer = null;
    }

    start(current, callback) {
        this.currentVersion = current;
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
                self.callback(update);
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

module.exports = Updater;
