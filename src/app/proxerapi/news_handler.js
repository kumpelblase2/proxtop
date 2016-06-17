const newsParser = require('../../page_parser').news;
const IPCHandler = require('./ipc_handler');

class NewsHandler extends IPCHandler {
    constructor(sessionHandler) {
        super();
        this.session_handler = sessionHandler;
    }

    loadNews() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.NEWS_API)
            .then(newsParser.parseNewsPage);
    }

    register() {
        this.handle('news', this.loadNews);
    }
}

module.exports = NewsHandler;
