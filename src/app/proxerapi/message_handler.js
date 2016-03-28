var ipc = require('electron').ipcMain;
var messageParser = require('../../page_parser').message;
var Promise = require('bluebird');

function MessagesHandler(app, sessionHandler) {
    this.app = app;
    this.session_handler = sessionHandler;
    this.settings = require('../settings');
    this.lastCheck = 0;
    this.cache = require('../db')('messages-cache');
}

MessagesHandler.prototype.loadConversations = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATIONS_API)
        .then(messageParser.parseMessagesList);
};

MessagesHandler.prototype.loadConversation = function(id) {
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
};

MessagesHandler.prototype.loadPreviousMessages = function(id, page) {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_API + id + "&p=" + page)
        .then(messageParser.parseConversation);
};

MessagesHandler.prototype.sendMessage = function(id, content) {
    return this.session_handler.openRequest(function(request) {
        return request.post({
            url: PROXER_BASE_URL + PROXER_PATHS.MESSAGE_WRITE_API + id,
            form: { message: content }
        });
    }).then(messageParser.parseMessagePostResponse);
};

MessagesHandler.prototype.refreshMessages = function(id, last_id) {
    last_id = last_id || 0;
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_NEW_API + id + "&mid=" + last_id)
        .then(messageParser.parseNewMessages);
};

MessagesHandler.prototype.checkNotifications = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_NOTIFICATIONS)
        .then(messageParser.parseMessagesNotification);
};

MessagesHandler.prototype.messageCheckLoop = function() {
    var self = this;
    setTimeout(function() {
        self.messageCheck();
        self.messageCheckLoop();
    }, 30000);
};

MessagesHandler.prototype.messageCheck = function() {
    var self = this;
    var enabled = self.settings.getGeneralSettings().message_notification;
    if(!enabled) {
        this.cache.remove();
        return;
    }

    var interval = self.settings.getGeneralSettings().check_message_interval;
    var time = new Date().getTime();
    if(time - self.lastCheck > interval * 60000 - 5000) {
        this.lastCheck = time;
        LOG.info("Check if new messages have arrived...");
        self.checkNotifications().then(function(notifications) {
            notifications.forEach(function(notification) {
                if(!self.cache.find({ username: notification.username })) {
                    LOG.verbose('Got new message from ' + notification.username);
                    self.app.notifyWindow('new-message', notification);
                }
            });

            self.cache.remove();
            notifications.forEach(function(not) { self.cache.push(not); });
        });
    }
};

MessagesHandler.prototype.register = function() {
    var self = this;
    ipc.on('conversations', function(event) {
        self.loadConversations().then(function(result) {
            event.sender.send('conversations', result);
        });
    });

    ipc.on('conversation', function(event, id) {
        self.loadConversation(id).then(function(result) {
            event.sender.send('conversation', result);
        });
    });

    ipc.on('conversation-write', function(event, id, message) {
        self.sendMessage(id, message).then(function(result) {
            event.sender.send('conversation-write', result);
        });
    });

    ipc.on('conversation-update', function(event, id, last_id) {
        self.refreshMessages(id, last_id).then(function(result) {
            event.sender.send('conversation-update', result);
        });
    });

    ipc.on('conversation-more', function(event, id, page) {
        self.loadPreviousMessages(id, page).then(function(result) {
            event.sender.send('conversation-more', result);
        });
    });

    this.messageCheckLoop();
};

module.exports = MessagesHandler;
