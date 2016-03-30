const ipc = require('electron').ipcMain;
const pageUtils = require('./page_utils');
const profileParser = require('../../page_parser').profile;
const Promise = require('bluebird');

function ProfileHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

ProfileHandler.prototype.loadProfile = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.OWN_PROFILE, true)
        .then(profileParser.parseProfile);
};

ProfileHandler.prototype.register = function() {
    const self = this;
    ipc.on('profile', function(event) {
        self.loadProfile().then(function(result) {
            event.sender.send('profile', result);
        });
    });
};

module.exports = ProfileHandler;
