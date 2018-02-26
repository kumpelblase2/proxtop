import { API_PATHS, PROXER_API_BASE_URL } from "../globals";

function fixPoints(user) {
    ['points_uploads', 'points_anime', 'points_manga', 'points_info', 'points_forum', 'points_misc'].forEach(name => {
        user[name] = parseInt(user[name]);
    });

    return user;
}

function totalPoints(user) {
    return user.points_uploads + user.points_anime + user.points_manga + user.points_info + user.points_forum + user.points_misc
}

function alterUser(user): Profile {
    user = fixPoints(user.data);
    return {
        uid: user.uid,
        username: user.username,
        avatar: user.avatar,
        status: {
            message: user.status,
            time: user.status_time
        },
        ranking: {
            total: totalPoints(user),
            anime: user.points_anime,
            manga: user.points_manga,
            additional: user.points_misc,
            uploads: user.points_uploads,
            forum: user.points_forum,
            wiki: user.points_info
        }
    }
}

export type Profile = {
    uid: number,
    username: string,
    avatar: string,
    status: {
        message: string,
        time: number,
    },
    ranking: {
        total: number,
        anime: number
        manga: number
        additional: number
        uploads: number
        forum: number
        wiki: number
    }
}

export default class ProfileHandler {
    session_handler: any;

    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadProfile(username: string): Promise<Profile> {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.USER.PROFILE + "?username=" + username).then(alterUser);
    }

    loadProfileByID(id: number): Promise<Profile> {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.USER.PROFILE + "?uid=" + id).then(alterUser);
    }
}
