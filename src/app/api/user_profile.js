const { IPCHandler, CacheControl } = require('../lib');
const settings = require('../settings');

const PROFILE_CACHE_TIME = 1800000; // 30 Minutes

class UserProfile extends IPCHandler {
    constructor(profileHandler) {
        super();
        this.profile = profileHandler;
        this.profileCache = new CacheControl(PROFILE_CACHE_TIME, this.profile.loadProfile.bind(this.profile));
    }
    
    register() {
        this.handle('profile', this.profileCache.get, this.profileCache);
        this.handleSync('current-user', () => {
            return settings.getAccountSettings().user.username;
        });

        this.provide('clear-messages-cache', () => {
            this.profileCache.invalidate();
        });
    }
}

module.exports = UserProfile;
