import IPCHandler from '../lib/ipc_handler';
import CacheControl from '../lib/cache_control';
import settings from "../settings";
import ProfileHandler, { Profile } from "../proxerapi/profile_handler";

const PROFILE_CACHE_TIME = 1800000; // 30 Minutes

export default class UserProfile extends IPCHandler {
    profile: ProfileHandler;
    profileCache: CacheControl<Profile>;

    constructor(profileHandler) {
        super();
        this.profile = profileHandler;
        // @ts-ignore
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
