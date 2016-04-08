const messageParser = require('../../page_parser').message;
const Promise = require('bluebird');
const translate = require('../translation');
const IPCHandler = require('./ipc_handler');

class MessagesHandler extends IPCHandler {
    constructor(app, sessionHandler) {
        super();
        this.app = app;
        this.session_handler = sessionHandler;
        this.settings = require('../settings');
        this.lastCheck = 0;
        this.cache = require('../db')('messages-cache');
        this.translation = translate();
    }

    loadConversations() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATIONS_API)
            .then(messageParser.parseMessagesList);
    }

    loadFavorites() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_FAVORITES)
            .then(messageParser.parseFavoriteMessages);
    }

    loadConversation(id) {
        return Promise.join(this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_API + id).then(messageParser.parseConversation),
                this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_PAGE + id).then(messageParser.parseConversationPage),
            function(conversation, participants) {
                return {
                    messages: conversation.messages,
                    has_more: conversation.has_more,
                    participants: participants
                };
            }
        );
    }

    loadPreviousMessages(id, page) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_API + id + "&p=" + page)
            .then(messageParser.parseConversation);
    }

    sendMessage(id, content) {
        return this.session_handler.openRequest(function(request) {
            return request.post({
                url: PROXER_BASE_URL + PROXER_PATHS.MESSAGE_WRITE_API + id,
                form: { message: content }
            });
        }).then(messageParser.parseMessagePostResponse);
    }

    refreshMessages(id, last_id = 0) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_NEW_API + id + "&mid=" + last_id)
            .then(messageParser.parseNewMessages);
    }

    checkNotifications() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_NOTIFICATIONS)
            .then(messageParser.parseMessagesNotification);
    }

    messageCheckLoop() {
        const self = this;
        setTimeout(function() {
            self.messageCheck();
            self.messageCheckLoop();
        }, 30000);
    }

    messageCheck() {
        const self = this;
        const enabled = self.settings.getGeneralSettings().message_notification;
        if(!enabled) {
            this.cache.remove();
            return;
        }

        const interval = self.settings.getGeneralSettings().check_message_interval;
        const time = new Date().getTime();
        if(time - self.lastCheck > interval * 60000 - 5000) {
            this.lastCheck = time;
            LOG.info("Check if new messages have arrived...");
            self.checkNotifications().then(function(notifications) {
                notifications.forEach(function(notification) {
                    if(!self.cache.find({ username: notification.username })) {
                        LOG.verbose('Got new message from ' + notification.username);
                        self.app.displayNotification({
                            type: 'new-message',
                            title: 'Proxtop',
                            content: self.translation.get('MESSAGES.NEW_MESSAGE', { user: notification.username }),
                            icon: 'assets/proxtop_logo_256.png'
                        });
                    }
                });

                self.cache.remove();
                notifications.forEach(function(not) { self.cache.push(not); });
            });
        }
    }

    register() {
        const self = this;
        this.handle('conversations', this.loadConversations);
        this.handle('conversation', this.loadConversation);
        this.handle('conversation-write', this.sendMessage);
        this.handle('conversation-update', this.refreshMessages);
        this.handle('conversation-more', this.loadPreviousMessages);
        this.handle('conversations-favorites', this.loadFavorites);

        this.messageCheckLoop();
    }
}

module.exports = MessagesHandler;
