var ipc = require('ipc');
var profileParser = require('../../page_parser').profile;
var Promise = require('bluebird');

function ProfileHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

ProfileHandler.prototype.loadProfile = function() {
    var self = this;
    return this.session_handler.getRequest()(PROXER_BASE_URL + PROXER_PATHS.OWN_PROFILE)
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
