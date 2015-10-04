var _ = require('lodash');
var Promise = require('bluebird');

var parser = {
};

parser.parseNewsPage = function(page) {
    var self = this;
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }

            return data.notifications;
        });
};

module.exports = parser;
