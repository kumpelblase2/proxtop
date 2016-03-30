const cheerio = require('cheerio');
const Promise = require('bluebird');
const _ = require('lodash');

function createResult(status, formData) {
    const data = { status: status };
    if(status !== 'logged-in') {
        data.data = formData;
    }

    return data;
}

function isLoggedIn($) {
    return $('#uname').length != 0;
}

const parser = {};
parser.extractFormData = function(page) {
    return Promise.resolve(page)
        .then(function(page) {
            const form = page('#login-form');
            return _.reduce(form.serializeArray(), function(result, info) {
                result[info.name] = info.value;
                return result;
            }, {});
        });
};

parser.parseLogin = function(page) {
    const self = this;
    return Promise.resolve(page).then(cheerio.load)
        .then(function(page) {
            if(isLoggedIn(page)) {
                return createResult('logged-in');
            } else {
                return parser.extractFormData(page).then(function(data) {
                    if(data == null || Object.keys(data).length == 0) {
                        return createResult('error', 'No form found');
                    } else {
                        return createResult('logged-out', data);
                    }
                });
            }
        }).catch(function(e) {
            return createResult('error', e);
        });
};

parser.parseLogout = function(page) {
    return Promise.resolve(page).then(cheerio.load)
        .then(function(page) {
            if(isLoggedIn(page)) {
                return parser.extractFormData(page).then(function(data) {
                    if(data == null) {
                        return createResult('error', "No logout form found.");
                    } else {
                        return createResult('logout', data);
                    }
                });
            } else {
                return createResult('logged-out', null);
            }
        });
};

parser.parseLoginCheck = function(body) {
    const parsed = JSON.parse(body);
    return parsed.error == 0;
};

parser.checkLogin = function(page) {
    const self = this;
    return Promise.resolve(page).then(cheerio.load)
        .then(function(page) {
            return !!isLoggedIn(page);
        });
};

module.exports = parser;
