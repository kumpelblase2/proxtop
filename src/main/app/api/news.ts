import IPCHandler from "../lib/ipc_handler";
import CacheControl from "../lib/cache_control";
import NewsHandler from "../proxerapi/news_handler";

const NEWS_CACHE_TIME = 300000; // 5 Minutes

export default class News extends IPCHandler {
    news: NewsHandler;
    newsCache: CacheControl<News[]>;

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
