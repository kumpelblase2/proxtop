var ipc = require('ipc');
var pageUtils = require('./page_utils');
var profileParser = require('../../page_parser').profile;
var Promise = require('bluebird');

function ProfileHandler(sessionHandler, loginChecker) {
    this.session_handler = sessionHandler;
    this.login_checker = loginChecker;
}

ProfileHandler.prototype.loadProfile = function() {
    var self = this;
    return this.createRequest()
        .then(this.login_checker.checkLogin(this.createRequest.bind(this))
        .then(profileParser.parseProfile);
};

ProfileHandler.prototype.createRequest = function() {
    return this.session_handler.getRequest()(RPOXER_BASE_URL + PROXER_PATHS.OWN_PROFILE);
}

ProfileHandler.prototype.register = function() {
    var self = this;
    ipc.on('profile', function(event) {
        self.loadProfile().then(function(result) {
            event.sender.send('profile', result);
        });
    });
};

module.exports = ProfileHandler;
