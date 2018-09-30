import IPCHandler from '../lib/ipc_handler';
import CacheControl from '../lib/cache_control';
import settings from "../settings";

const PROFILE_CACHE_TIME = 1800000; // 30 Minutes

export default class UserProfile extends IPCHandler {
    constructor(profileHandler) {
        super();
        this.profile = profileHandler;
        this.profileCache = new CacheControl(PROFILE_CACHE_TIME, this.profile.loadProfile.bind(this.profile), (a) => a);
    }
    
    register() {
        this.handle('profile', this.profileCache.get, this.profileCache);
        this.handleSync('current-user', () => {
            return settings.getAccountSettings().user.username;
        });

        this.provide('clear-message-cache', () => {
            this.profileCache.invalidate();
        });
    }
}
