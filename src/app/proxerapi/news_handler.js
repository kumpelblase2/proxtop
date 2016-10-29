const newsParser = require('../../page_parser').news;

class NewsHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    _loadNews() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.NEWS_API)
            .then(newsParser.parseNewsPage);
    }

    loadNews() {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.NOTIFICATIONS.NEWS)
            .then((full) => full.data);
    }
}

module.exports = NewsHandler;
