var { episode: episodeParser, stream: streamParser } = require('../../page_parser');
var util = require('util');
const IPCHandler = require('./ipc_handler');
const translate = require('../translation');

class EpisodeHandler extends IPCHandler {
    constructor(sessionHandler) {
        super();
        this.session_handler = sessionHandler;
        this.translation = translate();
    }

    loadEpisode(id, ep, sub) {
        return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub))
            .then(episodeParser.parseEpisode);
    }

    extractStream(stream) {
        var url;
        if(stream.type === 'link') {
            url = stream.code;
        } else {
            url = stream.replace.replace('#', stream.code);
        }

        if(url[0] == '/') {
            url = 'https:' + url;
        }

        LOG.verbose('Found stream url: ' + url);

        return this.session_handler.openRequest(url).then((content) => {
            return {
                page: content,
                stream: stream,
                url: url
            };
        }).then(streamParser.parseVideo);
    }

    register() {
        this.handle('episode', this.loadEpisode);
        this.provide('watch', (event, stream) => {
            this.extractStream(stream).then((video) => {
                LOG.verbose("Got video: " + video.url);
                event.sender.send('watch', video);
            }).catch((e) => {
                LOG.error("Error extracting stream", e);
                console.log(this.translation);
                event.sender.send('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.STREAMS.CANNOT_PARSE));
            });
        });
    }
}

module.exports = EpisodeHandler;
