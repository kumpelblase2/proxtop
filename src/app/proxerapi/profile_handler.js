const profileParser = require('../../page_parser').profile;

function totalPoints(user) {
    return user.points_uploads + user.points_anime + user.points_manga + user.points_info + user.points_forum + user.points_misc
}

function alterUser(user) {
    return {
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

class ProfileHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadProfile(username) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.USER.PROFILE + "?username=" + username).then(alterUser);
    }

    loadProfileByID(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.USER.PROFILE + "?uid=" + id).then(alterUser);
    }
}

module.exports = ProfileHandler;
