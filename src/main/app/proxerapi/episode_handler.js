import util from "util";
import Log from "../util/log";
import { parseVideo } from "../../page_parser/stream"
import { PROXER_BASE_URL, PROXER_PATHS } from "../globals";
import { parseEpisode } from "../../page_parser/episode";

export default class EpisodeHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadEpisode(id, ep, sub) {
        return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub))
            .then(parseEpisode);
    }

    extractStream(stream) {
        const url = this.getStreamUrl(stream);
        Log.verbose('Found stream url: ' + url);

        return this.session_handler.openRequest(url).then((content) => {
            return {
                page: content,
                stream: stream,
                url: url
            };
        }).then(parseVideo);
    }

    loadStream(stream) {
        return this.extractStream(stream).then((video) => {
            Log.verbose("Got video: " + video.url);
            return video;
        });
    }

    getStreamUrl(stream) {
        let url;
        if(stream.type === 'link') {
            url = stream.code;
        } else {
            url = stream.replace.replace('#', stream.code);
        }

        if(url[0] === '/') {
            url = 'https:' + url;
        }

        return url;
    }
}
