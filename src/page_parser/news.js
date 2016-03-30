const _ = require('lodash');
const Promise = require('bluebird');

const parser = {
};

parser.parseNewsPage = function(page) {
    const self = this;
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }

            return data.notifications;
        });
};

module.exports = parser;
