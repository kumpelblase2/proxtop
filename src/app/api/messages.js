const { IPCHandler, CacheControl } = require('../lib');
const { MessagesStorage } = require('../storage');

const CONVERSATIONS_CACHE_TIME = 60000; // 1 Minute
const MESSAGES_CACHE_TIME = CONVERSATIONS_CACHE_TIME;

class Messages extends IPCHandler {
    constructor(messagesHandler) {
        super();
        this.messages = messagesHandler;
        this.conversationsCache = new CacheControl(CONVERSATIONS_CACHE_TIME, this.messages.loadConversations.bind(this.messages));
        this.messagesCache = new CacheControl(MESSAGES_CACHE_TIME, this.messages.loadConversation.bind(this.messages), (id) => id);
    }

    register() {
        const self = this;
        this.handle('conversation-write', this.messages.sendMessage, this.messages);
        this.handle('conversation-update', this.messages.refreshMessages, this.messages);
        this.provide('conversation-more', function(id, page, event) {
            if(MessagesStorage.hasMore(id)) {
                const newMessages = this.messages.loadPreviousMessages(id, page);
                MessagesStorage.addPage(id, newMessages.messages, newMessages.has_more);
                event.sender.send('conversation', oldMessages);
            }
        });
        this.handle('conversation-favorite', (id) => {
            MessagesStorage.markConversationFavorite(id, true);
            return this.messages.favoriteMessage(id);
        });
        this.handle('conversation-unfavorite', (id) => {
            MessagesStorage.markConversationFavorite(id, false);
            return this.messages.unfavoriteMessage(id);
        });
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

        this.handle('conversations', function*() {
            yield MessagesStorage.getAllConversations();
            yield self.messages.loadConversations().then((result) => {
                MessagesStorage.addConversationsIfNotExists(result);
                return this.messages.loadFavorites().then((favorites) => {
                    favorites.forEach((fav) => {
                        MessagesStorage.markConversationFavorite(fav.id, true);
                    });
                    return MessagesStorage.getAllConversations();
                });
            });
        });

        this.handle('conversation', function*(id) {
            id = parseInt(id);
            yield MessagesStorage.getConversation(id);
            yield self.messages.loadConversation(id).then((result) => {
                MessagesStorage.addMessages(id, result.messages, result.has_more);
                MessagesStorage.markConversationFavorite(id, result.favorite);
                MessagesStorage.markConversationBlocked(id, result.blocked);
                MessagesStorage.updateParticipants(id, result.participants);
                return MessagesStorage.getConversation(id);
            });
        });

        this.provide('clear-messages-cache', () => {
            [this.conversationsCache, this.messagesCache].forEach((cache) => {
                cache.invalidate();
            })
        });

        this.messages.messageCheckLoop();
    }
}

module.exports = Messages;
