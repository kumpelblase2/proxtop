const ipc = require('electron').ipcMain;
const newsParser = require('../../page_parser').news;
const Promise = require('bluebird');

function NewsHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

NewsHandler.prototype.loadNews = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.NEWS_API)
        .then(newsParser.parseNewsPage);
};

NewsHandler.prototype.register = function() {
    const self = this;
    ipc.on('news', function(event) {
        self.loadNews().then(function(result) {
            event.sender.send('news', result);
        });
    });
};

module.exports = NewsHandler;
