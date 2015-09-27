var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));

module.exports = {
    createIfNotExists: function(inPath) {
        return fs.statAsync(inPath).catch(function(e) {
            return fs.openAsync(inPath, 'w').then(fs.closeAsync);
        });
    },
    capizalizeFirstLetter: function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
};
