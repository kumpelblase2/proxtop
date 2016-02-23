var semver = require('semver');
var request = require('request-promise');
var _ = require('lodash');

var GITHUB_URL = "https://api.github.com/repos/kumpelblase2/proxtop/releases";

function Updater(current, callback) {
    this.currentVersion = current;
    this.callback = callback;
}

Updater.prototype.run = function() {
    var self = this;
    setTimeout(function() {
        self.check();
    }, 1000);
};

Updater.prototype.check = function() {
    var self = this;
    request({
        url: GITHUB_URL,
        headers: {
            'User-Agent': 'proxtop-' + this.currentVersion
        }
    }).then(JSON.parse).then(function(releases) {
        var actual = _.filter(releases, { prerelease: false, draft: false });
        var orderedNewerReleases = _.reverse(_.sortBy(_.filter(actual, function(release) {
            return semver.gt(release.tag_name, self.currentVersion);
        }), function(release) {
            return new Date(release.published_at).getTime();
        }));

        return orderedNewerReleases[0];
    }).then(function(update) {
        if(update) {
            self.callback(update);
        }
    }).catch(function(e) {
        if(e.statusCode == 403) {
            LOG.warning("GitHub API limit reached.");
        } else {
            LOG.error("There was an issue doing github update check:", {
                error: e
            });
        }
    });
};

module.exports = Updater;
