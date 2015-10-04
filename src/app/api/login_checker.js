var pageUtils = require('./page_utils');
var Promise = require('bluebird');
var _ = require('lodash');

function LoginChecker(loginHandler, db) {
    this.login_handler = loginHandler;
    this.db = db;
}

LoginChecker.prototype.checkLogin = function(doRequest) {
    return function(body) {
        if(pageUtils.checkUnauthorized(body)) {
            var details = this.getLoginDetails();
            if(!details) {
                throw 'No details saved, login manually.';
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
