var ipc = require('ipc');
var episodeParser = require('../../page_parser').episode;
var Promise = require('bluebird');
var util = require('util');

function EpisodeHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

EpisodeHandler.prototype.loadEpisode = function(id, ep, sub) {
    return this.session_handler.openRequest(PROXER_BASE_URL + util.format(PROXER_PATHS.WATCH_ANIME, id, ep, sub))
        .then(episodeParser.parseEpisode);
};

EpisodeHandler.prototype.register = function() {
    var self = this;
    ipc.on('watch', function(event, id, ep, sub) {
        self.loadEpisode(id, ep, sub).then(function(result) {
            event.sender.send('watch', result);
        });
    });
};

module.exports = EpisodeHandler;
