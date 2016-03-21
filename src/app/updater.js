var request = require('request-promise');
var _ = require('lodash');
var utils = require('./utils');

function Updater(check_url) {
    this.check_url = check_url;
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

Updater.prototype.check = function() {
    var self = this;
    LOG.verbose('Running update check...');
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
            //TODO disable until unblock time reached
            LOG.warning("GitHub API limit reached.");
        } else {
            LOG.error("There was an issue doing github update check:", {
                error: e
            });
        }
    });
};

module.exports = Updater;
