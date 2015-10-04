var pageUtils = require('./page_utils');
var Promise = require('bluebird');
var _ = require('lodash');

function LoginChecker(loginHandler, db) {
    this.login_handler = loginHandler;
    this.db = db;
    this.app = require('../../../main');
}

LoginChecker.prototype.checkLogin = function(doRequest) {
    var self = this;
    return function(body) {
        if(pageUtils.checkUnauthorized(body)) {
            var details = self.getLoginDetails();
            if(!details) {
                self.app.getWindow().send('check-login', false);
                throw new Error('No details saved, login manually.');
            }
            return this.login_handler.login(details.user.username, details.user.password, details.keep_login)
                    .then(doRequest);
        } else {
            return body;
        }
    };
};

LoginChecker.prototype.getLoginDetails = function() {
    var settings = this.db('settings').find({ type: 'account' });
    if(!settings) {
        return null;
    }

    return _.pick(settings, 'keep_login', 'user');
};

module.exports = LoginChecker;
