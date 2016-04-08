const pageUtils = require('./page_utils');
const profileParser = require('../../page_parser').profile;
const Promise = require('bluebird');
const IPCHandler = require('./ipc_handler');

class ProfileHandler extends IPCHandler {
    constructor(sessionHandler) {
        super();
        this.session_handler = sessionHandler;
    }

    loadProfile() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.OWN_PROFILE, true)
            .then(profileParser.parseProfile);
    }

    register() {
        this.handle('profile', this.loadProfile);
    }
}

module.exports = ProfileHandler;
