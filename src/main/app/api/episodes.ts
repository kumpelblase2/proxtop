import IPCHandler from "../lib/ipc_handler";
import Log from "../util/log";
import translate, { Translation } from "../translation";
import CacheControl from "../lib/cache_control"
import { Errors as ERRORS } from "../globals";
import EpisodeHandler from "../proxerapi/episode_handler";
import { EpisodeInfo } from "../../page_parser/episode";
import { VideoSource } from "../../page_parser/stream";

const EPISODE_CACHE_TIME = 900000; // 15 Minutes
const STREAM_CACHE_TIME = 21600000; // 6 Hours

export default class Episodes extends IPCHandler {
    episode: EpisodeHandler;
    episodeCache: CacheControl<EpisodeInfo>;
    streamCache: CacheControl<VideoSource>;
    translation: Translation;

    constructor(episodeHandler) {
        super();
        this.episode = episodeHandler;
        this.episodeCache = new CacheControl<EpisodeInfo>(EPISODE_CACHE_TIME, this.episode.loadEpisode.bind(this.episode), (id, ep, sub) => {
            return `${id}:${ep}:${sub}`;
        });
        this.streamCache = new CacheControl<VideoSource>(STREAM_CACHE_TIME, this.episode.loadStream.bind(this.episode), this.episode.getStreamUrl);
        this.translation = translate();
    }

    register() {
        this.handle('episode', this.episodeCache.get, this.episodeCache);
        this.provide('clear-messages-cache', () => {
            this.episodeCache.invalidate();
            this.streamCache.invalidate();
        });
        this.provide('watch', (event, stream) => {
            this.streamCache.get(stream).then((stream) => {
                event.sender.send('watch', stream);
            }).catch((e) => {
                Log.error("Error extracting stream", e);
                event.sender.send('watch', null);
                event.sender.send('error', this.translation.get(ERRORS.SEVERITY.WARNING), this.translation.get(ERRORS.STREAMS.CANNOT_PARSE));
            });
        });
    }
}
