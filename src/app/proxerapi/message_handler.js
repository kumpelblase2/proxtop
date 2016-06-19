const messageParser = require('../../page_parser').message;
const Promise = require('bluebird');
const translate = require('../translation');
const { MessageCache } = require('../storage');
const Notification = require('../notification');
const windowManager = require('../ui/window_manager');
const settings = require('../settings');

class MessagesHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
        this.lastCheck = 0;
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

    favoriteMessage(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_MARK_FAVORITE + id)
            .then(messageParser.parseMarkFavorite).then(function(result) {
                result.id = id;
                return result;
            });
    }

    unfavoriteMessage(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_UNMARK_FAVORITE + id)
            .then(messageParser.parseMarkFavorite).then(function(result) {
                result.id = id;
                return result;
            });
    }

    blockConversation(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_MARK_BLOCKED + id)
            .then(messageParser.parseMarkBlocked).then(function(result) {
                result.id = id;
                return result;
            });
    }

    unblockConversation(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_UNMARK_BLOCKED + id)
            .then(messageParser.parseMarkBlocked).then(function(result) {
                result.id = id;
                return result;
            });
    }

    reportConversation(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_REPORT + id)
            .then(messageParser.parseReported).then((result) => {
                result.id = id;
                return result;
            });
    }

    loadConversation(id) {
        return Promise.join(this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_API + id).then(messageParser.parseConversation),
                this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_PAGE + id).then(messageParser.parseConversationPage),
            (conversation, participants) => {
                conversation.participants = participants;
                return conversation;
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
        setTimeout(() => {
            this.messageCheck();
            this.messageCheckLoop();
        }, 30000);
    }

    messageCheck() {
        const self = this;
        const enabled = settings.getGeneralSettings().message_notification;
        if(!enabled) {
            MessageCache.clear();
            return;
        }

        const interval = settings.getGeneralSettings().check_message_interval;
        const time = new Date().getTime();
        if(time - self.lastCheck > interval * 60000 - 5000) {
            this.lastCheck = time;
            LOG.info("Check if new messages have arrived...");
            self.checkNotifications().then((notifications) => {
                notifications.forEach((notification) => {
                    if(!MessageCache.hasReceived(notification.username)) {
                        LOG.verbose('Got new message from ' + notification.username);
                        Notification.displayNotification({
                            title: 'Proxtop',
                            message: self.translation.get('MESSAGES.NEW_MESSAGE', { user: notification.username }),
                            icon: 'assets/proxtop_logo_256.png'
                        }, () => {
                            windowManager.notifyWindow('state-change', 'message', { id: notification.id });
                        });
                    }
                });

                MessageCache.clear();
                notifications.forEach((not) => MessageCache.markReceived(not.username));
            });
        }
    }
}

module.exports = MessagesHandler;
