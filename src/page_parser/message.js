var _ = require('lodash');
var Promise = require('bluebird');

var parser = {
};

parser.parseMessagesList = function(page) {
    var self = this;
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }
            return data.conferences;
        });
};

parser.parseConversation = function(page) {
    var self = this;
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }

            return data.messages;
        });
};

module.exports = parser;
