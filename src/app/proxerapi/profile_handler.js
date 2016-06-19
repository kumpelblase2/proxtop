const profileParser = require('../../page_parser').profile;

class ProfileHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadProfile() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.OWN_PROFILE, true)
            .then(profileParser.parseProfile);
    }
}

module.exports = ProfileHandler;
