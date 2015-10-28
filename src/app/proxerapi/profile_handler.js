var ipc = require('ipc');
var pageUtils = require('./page_utils');
var profileParser = require('../../page_parser').profile;
var Promise = require('bluebird');

function ProfileHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

ProfileHandler.prototype.loadProfile = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.OWN_PROFILE, true)
        .then(profileParser.parseProfile);
};

ProfileHandler.prototype.register = function() {
    var self = this;
    ipc.on('profile', function(event) {
        self.loadProfile().then(function(result) {
            event.sender.send('profile', result);
        });
    });
};

module.exports = ProfileHandler;
