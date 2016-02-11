var ipc = require('ipc');
var episodeParser = require('../../page_parser').episode;
var streamParser = require('../../page_parser').stream;
var util = require('util');

function EpisodeHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

EpisodeHandler.prototype.loadEpisode = function(id, ep, sub) {
    return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub))
        .then(episodeParser.parseEpisode);
};

EpisodeHandler.prototype.extractStream = function(stream) {
    var url = stream.replace.replace('#', stream.code);
    return this.session_handler.openRequest(url).then(function(content) {
        return {
            page: content,
            stream: stream
        };
    }).then(streamParser.parseVideo);
};

EpisodeHandler.prototype.register = function() {
    var self = this;
    ipc.on('episode', function(event, id, ep, sub) {
        self.loadEpisode(id, ep, sub).then(function(result) {
            event.sender.send('episode', result);
        });
    });


    ipc.on('watch', function(event, stream) {
        self.extractStream(stream).then(function(video) {
            event.sender.send('watch', video);
        });
    });
};

module.exports = EpisodeHandler;
