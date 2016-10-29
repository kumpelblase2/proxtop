const { IPCHandler, MessageChecker } = require('../lib');
const { MessagesStorage } = require('../storage');
const _ = require('lodash');

const FAVORITE_MESSAGES = 'favour';

class Messages extends IPCHandler {
    constructor(messagesHandler) {
        super();
        this.messages = messagesHandler;
        this.lastMessageId = 0;
        this.messageChecker = new MessageChecker(this.messages, this);
    }

    register() {
        this.messages.retrieveConstants();
        const self = this;
        this.handle('conversation-write', this.messages.sendMessage, this.messages);
        this.provide('conversation-update', (event, id) => {
            this.updateConversation(id).then(() => {
                event.sender.send('conversation', MessagesStorage.getConversation(id));
            });
        });
        this.provide('conversation-more', (event, id) => {
            this.loadPreviousMessages(id).then(() => {
                event.sender.send('conversation', MessagesStorage.getConversation(id));
            });
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
                return this.messages.loadConversations(FAVORITE_MESSAGES).then((favorites) => {
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
            yield this.refreshConversation(id).then(() => {
                return MessagesStorage.getConversation(id);
            });
        });

        this.handleSync('message-constants', () => this.messages.constants);

        setTimeout(() => {
            this.messageChecker.start();
        }, 10000);
    }

    refreshConversation(id) {
        return this.messages.loadConversation(id).then((info) => {
            const users = info.users.map((user) => {
                user.owner = user.uid == info.conference.leader;
                return user;
            });

            MessagesStorage.updateConversation(id, null, info.conference.topic, null, users, null, null, null);
            const hasMore = this.isMaximumMessageAmount(info.messages);
            MessagesStorage.addMessages(id, info.messages, hasMore);
        });
    }

    updateConversation(id) {
        const lastMessage = MessagesStorage.getLastMessage(id);
        return this.messages.refreshMessages(id, lastMessage.id).then((newMessages) => {
            MessagesStorage.addMessages(id, newMessages.messages);
        });
    }

    loadPreviousMessages(id) {
        const conv = MessagesStorage.getConversation(id);
        return this.messages.loadMessages(id, conv.messages[0].message_id).then((newMessages) => {
            const hasMore = this.isMaximumMessageAmount(newMessages);
            MessagesStorage.addMessages(id, newMessages, hasMore);
        });
    }

    loadLatestMessages() {
        return this.messages.loadMessages(0, this.lastMessageId).then((messages) => {
            messages = messages.sort((first, second) => first.timestamp - second.timestamp);
            if(messages.length > 0) {
                this.lastMessageId = messages[messages.length - 1].message_id;
            }

            const groupedMessages = _.groupBy(messages, 'conversation_id');
            const unknownMessages = [];
            for(const convId in groupedMessages) {
                const newForConversation = MessagesStorage.addMessages(convId, groupedMessages[convId]);
                unknownMessages.push(...newForConversation);
            }

            return {
                hasMore: this.isMaximumMessageAmount(messages),
                messages: unknownMessages
            };
        });
    }

    isMaximumMessageAmount(messages) {
        return messages.length >= this.messages.constants.messagesPageSize;
    }
}

module.exports = Messages;
