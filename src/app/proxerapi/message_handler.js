var ipc = require('electron').ipcMain;
var messageParser = require('../../page_parser').message;
var Promise = require('bluebird');

function MessagesHandler(sessionHandler) {
    this.session_handler = sessionHandler;
}

MessagesHandler.prototype.loadConversations = function() {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATIONS_API)
        .then(messageParser.parseMessagesList);
};

MessagesHandler.prototype.loadConversation = function(id) {
    return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_API + id)
        .then(messageParser.parseConversation);
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
};

module.exports = MessagesHandler;
