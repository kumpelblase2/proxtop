const { IPCHandler, CacheControl } = require('../lib');

const CONVERSATIONS_CACHE_TIME = 60000; // 1 Minute
const FAVORITE_CACHE_TIME = CONVERSATIONS_CACHE_TIME;
const MESSAGES_CACHE_TIME = CONVERSATIONS_CACHE_TIME;
const OLD_MESSAGE_CACHE = 300000; // 5 Minutes 

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
        this.handle('conversation-create', (conversation) => {
            if(conversation.participants.length === 1) {
                return this.messages.newConversation({
                    text: conversation.text,
                    recipient: conversation.participants[0]
                });
            } else {
                return this.messages.newConference(conversation);
            }
        });

        this.provide('clear-messages-cache', () => {
            [this.conversationsCache, this.favoritesCache, this.messagesCache, this.oldMessagesCache].forEach((cache) => {
                cache.invalidate();
            })
        });

        this.messages.messageCheckLoop();
    }
}

module.exports = Messages;
