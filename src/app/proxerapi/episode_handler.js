const { episode: episodeParser, stream: streamParser } = require('../../page_parser');
const util = require('util');

class EpisodeHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
        
    }

    loadEpisode(id, ep, sub) {
        return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub))
            .then(episodeParser.parseEpisode);
    }

    extractStream(stream) {
        const url = this.getStreamUrl(stream);
        LOG.verbose('Found stream url: ' + url);

        return this.session_handler.openRequest(url).then((content) => {
            return {
                page: content,
                stream: stream,
                url: url
            };
        }).then(streamParser.parseVideo);
    }

    loadStream(stream) {
        return this.extractStream(stream).then((video) => {
            LOG.verbose("Got video: " + video.url);
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

        if(url[0] == '/') {
            url = 'https:' + url;
        }

        return url;
    }
}

module.exports = EpisodeHandler;
