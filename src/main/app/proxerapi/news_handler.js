class NewsHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
    }

    loadNews() {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.NOTIFICATIONS.NEWS)
            .then((full) => full.data);
    }
}

module.exports = NewsHandler;
