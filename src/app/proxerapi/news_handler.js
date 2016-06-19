const newsParser = require('../../page_parser').news;

class NewsHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadNews() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.NEWS_API)
            .then(newsParser.parseNewsPage);
    }

}

module.exports = NewsHandler;
