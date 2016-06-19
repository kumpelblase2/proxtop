const IPCHandler = require('../lib/ipc_handler');
const CacheControl = require('../lib/cache_control');

const EPISODE_CACHE_TIME = 900000;
const STREAM_CACHE_TIME = 21600000;

class Episodes extends IPCHandler {
    constructor(episodeHandler) {
        super();
        this.episode = episodeHandler;
        this.episodeCache = new CacheControl(EPISODE_CACHE_TIME, this.episode.loadEpisode.bind(this.episode), (id, ep, sub) => {
            return `${id}:${ep}:${sub}`;
        });
        this.streamCache = new CacheControl(STREAM_CACHE_TIME, this.episode.loadStream.bind(this.episode), this.episode.getStreamUrl);
    }

    register() {
        this.handle('episode', this.episodeCache.get, this.episodeCache);
        this.provide('watch', (event, stream) => {
            this.streamCache.get(stream).then((stream) => {
                event.sender.send('watch', stream);
            }).catch((e) => {
                LOG.error("Error extracting stream", e);
                event.sender.send('watch', null);
                event.sender.send('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.STREAMS.CANNOT_PARSE));
            });
        });
    }
}

module.exports = Episodes;