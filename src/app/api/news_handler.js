var ipc = require('ipc');
var newsParser = require('../../page_parser').news;
var Promise = require('bluebird');

function NewsHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

NewsHandler.prototype.loadNews = function() {
    var self = this;
    return this.session_handler.getRequest()(PROXER_BASE_URL + PROXER_PATHS.NEWS)
        .then(newsParser.parseNewsPage);
};

NewsHandler.prototype.register = function() {
    var self = this;
    ipc.on('news', function(event) {
        self.loadNews().then(function(result) {
            event.sender.send('news', result);
        });
    });
};

module.exports = NewsHandler;
