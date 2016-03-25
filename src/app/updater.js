var request = require('request-promise');
var _ = require('lodash');
var utils = require('./utils');
var db = require('./db');

function Updater(check_url) {
    this.check_url = check_url;
    this.settings = db('updater');
    this.limited = this.settings.find({ name: 'limited' });
    if(!this.limited) {
        this.limited = { value: false, release_time: 0, name: 'limited' };
        this.settings.push(this.limited);
    }
}

Updater.prototype.start = function(current, callback) {
    this.currentVersion = current;
    this.callback = callback;
    var self = this;
    setTimeout(function() {
        self.check();
    }, 1000);
};

Updater.prototype.stop = function() {

};

Updater.prototype.saveLimitation = function() {
    this.settings.chain().find({ name: 'limited' }).assign(this.limited).value();
};

Updater.prototype.isLimited = function() {
    if(!this.limited || (this.limited && !this.limited.value)) {
        return false;
    }

    var isReleased = this.limited.release_time * 1000 < new Date().getTime();
    if(isReleased) {
        this.limited.value = false;
        this.limited.release_time = 0;
        this.saveLimitation();
        return false;
    }

    return true;
};

Updater.prototype.check = function() {
    var self = this;
    LOG.verbose('Running update check...');
    if(this.isLimited()) {
        LOG.verbose("Still rate limited. Skipping.");
        return;
    }

    request({
        url: self.check_url,
        headers: {
            'User-Agent': 'proxtop-' + this.currentVersion
        }
    }).then(JSON.parse).then(function(releases) {
        return utils.findLatestRelease(releases, self.currentVersion);
    }).then(function(update) {
        LOG.verbose('Update available? ' + (update ? 'Yes' : 'No'));
        if(update) {
            self.callback(update);
        }
    }).catch(function(e) {
        if(e.statusCode == 403) {
            LOG.warn("GitHub API limit reached.");
            self.limited.value = true;
            self.limited.release_time = parseInt(e.response.headers['x-ratelimit-reset']);
            self.saveLimitation();
        } else {
            LOG.error("There was an issue doing github update check:", {
                error: e
            });
        }
    });
};

module.exports = Updater;
