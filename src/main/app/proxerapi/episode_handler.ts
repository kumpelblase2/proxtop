import { format } from "util";
import Log from "../util/log";
import { parseVideo, VideoSource } from "../../page_parser/stream"
import { PROXER_BASE_URL, PROXER_PATHS } from "../globals";
import { EpisodeInfo, parseEpisode } from "../../page_parser/episode";
import SessionHandler from "../lib/session_handler";

export default class EpisodeHandler {
    session_handler: SessionHandler;

    constructor(sessionHandler: SessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadEpisode(id, ep, sub): Promise<EpisodeInfo> {
        return this.session_handler.openRequest(PROXER_BASE_URL + format(PROXER_PATHS.WATCH_ANIME, id, ep, sub))
            .then(parseEpisode);
    }

    extractStream(stream): Promise<VideoSource> {
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

    loadStream(stream): Promise<VideoSource> {
        return this.extractStream(stream).then((video) => {
            Log.verbose("Got video: " + video.url);
            return video;
        });
    }

    getStreamUrl(stream): string {
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
