var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var _ = require('lodash');

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
        var updates = [];
        newEntries.forEach(function(entry) {
            var oldEntry = _.find(oldEntries, { id: entry.id });
            if(oldEntry) {
                if(entry.online && !oldEntry.online) {
                    updates.push(entry);
                }
            }
        });

        return updates;
    }
};
