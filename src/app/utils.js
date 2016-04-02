const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const _ = require('lodash');
const semver = require('semver');
const os = require('os');

module.exports = {
    createIfNotExists: function(inPath) {
        return fs.statAsync(inPath).catch(function(e) {
            return fs.openAsync(inPath, 'w').then(fs.closeAsync);
        });
    },
    createDirIfNotExists: function (path) {
        try {
            fs.mkdirSync(path);
        } catch(e) {
            if(e.code != 'EEXIST') {
                throw e;
            }
        }
    },

    capizalizeFirstLetter: function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    },

    getOnlineDiff: function(oldEntries, newEntries) {
        const updates = [];
        newEntries.forEach(function(entry) {
            const oldEntry = _.find(oldEntries, { id: entry.id });
            if(oldEntry) {
                if(entry.status && !oldEntry.status) {
                    updates.push(entry);
                }
            }
        });

        return updates;
    },

    findLatestRelease: function(releases, current) {
        const actual = _.filter(releases, { prerelease: false, draft: false });
        const orderedNewerReleases = _.reverse(_.sortBy(_.filter(actual, function(release) {
            if(current) {
                return semver.gt(release.tag_name, current);
            } else {
                return true;
            }
        }), function(release) {
            return new Date(release.published_at).getTime();
        }));

        return orderedNewerReleases[0];
    },

    isNotificationSupported: function(platform = os.platform(), release = os.release()) {
        return platform != 'win32' || os.release.startsWith('10.');
    }
};
