const IPCHandler = require('../lib/ipc_handler');
const CacheControl = require('../lib/cache_control');

const CONVERSATIONS_CACHE_TIME = 60000;
const FAVORITE_CACHE_TIME = CONVERSATIONS_CACHE_TIME;
const MESSAGES_CACHE_TIME = CONVERSATIONS_CACHE_TIME;
const OLD_MESSAGE_CACHE = 300000;

class Messages extends IPCHandler {
    constructor(messagesHandler) {
        super();
        this.messages = messagesHandler;
        this.conversationsCache = new CacheControl(CONVERSATIONS_CACHE_TIME, this.messages.loadConversations.bind(this.messages));
        this.favoritesCache = new CacheControl(FAVORITE_CACHE_TIME, this.messages.loadFavorites.bind(this.messages));
        this.messagesCache = new CacheControl(MESSAGES_CACHE_TIME, this.messages.loadConversation.bind(this.messages), (id) => id);
        this.oldMessagesCache = new CacheControl(OLD_MESSAGE_CACHE, this.messages.loadPreviousMessages.bind(this.messages), (id, page) => {
            return `${id}:${page}`;
        });
    }

    register() {
        this.handle('conversations', this.conversationsCache.get, this.conversationsCache);
        this.handle('conversation', this.messagesCache.get, this.messagesCache);
        this.handle('conversation-write', this.messages.sendMessage, this.messages);
        this.handle('conversation-update', this.messages.refreshMessages, this.messages);
        this.handle('conversation-more', this.oldMessagesCache.get, this.oldMessagesCache);
        this.handle('conversations-favorites', this.favoritesCache.get, this.favoritesCache);
        this.handle('conversation-favorite', this.messages.favoriteMessage, this.messages);
        this.handle('conversation-unfavorite', this.messages.unfavoriteMessage, this.messages);
        this.handle('conversation-block', this.messages.blockConversation, this.messages);
        this.handle('conversation-unblock', this.messages.unblockConversation, this.messages);
        this.handle('conversation-report', this.messages.reportConversation, this.messages);

        this.messages.messageCheckLoop();
    }
}

module.exports = Messages;