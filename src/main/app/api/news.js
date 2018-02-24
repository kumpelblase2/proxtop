const { IPCHandler, CacheControl } = require('../lib');

const NEWS_CACHE_TIME = 300000; // 5 Minutes

class News extends IPCHandler {
    constructor(newsHandler) {
        super();
        this.news = newsHandler;
        this.newsCache = new CacheControl(NEWS_CACHE_TIME, this.news.loadNews.bind(this.news));
    }

    register() {
        this.handle('news', this.newsCache.get, this.newsCache);
        this.provide('clear-messages-cache', () => {
            this.newsCache.invalidate();
        });
    }
}

module.exports = News;
