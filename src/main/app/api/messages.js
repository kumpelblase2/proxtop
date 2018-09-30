import IPCHandler from "../lib/ipc_handler";
import DelayTracker from "../lib/delay_tracker";
import MessageChecker from "../lib/message_checker";
import { MessagesStorage } from "../storage";

const _ = require('lodash');
const Promise = require('bluebird');

const FAVORITE_MESSAGES = 'favour';

function sortMessages(messages) {
    return messages.sort((messageA, messageB) => messageA.message_id - messageB.message_id);
}

export default class Messages extends IPCHandler {
    constructor(messagesHandler) {
        super();
        this.messages = messagesHandler;
        this.lastMessageId = 0;
        this.messageChecker = new MessageChecker(this.messages, this);
        this.trackingId = 0;
        this.delayTracker = new DelayTracker();
        this.delayTracker.name = "-single message update-";
        this.lastUpdate = 0;
    }

    register() {
        this.messages.retrieveConstants();
        const self = this;
        this.handle('conversation-write', this.messages.sendMessage, this.messages);
        this.provide('conversation-update', (event, id) => {
            if(this.trackingId != id) {
                this.trackingId = id;
                this.delayTracker.reset();
            }

            let promise;
            if(this.lastUpdate + this.delayTracker.delay <= Date.now()) {
                promise = this.updateConversation(id);
            } else {
                promise = Promise.resolve();
            }

            promise.then(() => {
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
        this.provide('conversation-read', (event, id) => {
            if(!MessagesStorage.hasRead(id)) {
                MessagesStorage.markConversationRead(id, true);
                this.messages.markConversationRead(id).then(() => {
                    event.sender.send('conversation', MessagesStorage.getConversation(id));
                });
            }
        });
        this.provide('conversation-unread', (event, id) => {
            if(MessagesStorage.hasRead(id)) {
                MessagesStorage.markConversationRead(id, false);
                this.messages.markConversationUnread(id).then(() => {
                    event.sender.send('conversation', MessagesStorage.getConversation(id));
                });
            }
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
        this.lastUpdate = Date.now();
        return this._loadUntilKnown(id, 0).then((newMessages) => {
            if(newMessages.length > 0) {
                this.delayTracker.reset();
            } else {
                this.delayTracker.increase();
            }
        });
    }

    _loadUntilKnown(id, start) {
        return this.messages.loadMessages(id, start).then((newMessages) => {
            const addedMessages = MessagesStorage.addMessages(id, newMessages.messages);
            if(addedMessages.length === newMessages.length && this.isMaximumMessageAmount(addedMessages)) {
                const sorted = sortMessages(addedMessages);
                return this._loadUntilKnown(id, sorted[0]).then((newMessages) => {
                    return addedMessages.concat(newMessages);
                });
            } else {
                return addedMessages;
            }
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
            messages = sortMessages(messages);
            if(messages.length > 0) {
                this.lastMessageId = messages[messages.length - 1].message_id;
            }

            const groupedMessages = _.groupBy(messages, 'conference_id');
            const unknownMessages = [];
            for(const convId in groupedMessages) {
                const intId = parseInt(convId); // JS automatically turns int keys into strings... Fuck you JS.
                const newForConversation = MessagesStorage.addMessagesOrCreate(intId, groupedMessages[intId]);
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
