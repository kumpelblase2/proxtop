const messageParser = require('../../page_parser').message;
const Promise = require('bluebird');

class MessagesHandler {
    constructor(sessionHandler) {
        this.session_handler = sessionHandler;
        this.constants = {
            maxTextLength: -1,
            conferencePageSize: -1,
            messagesPageSize: -1,
            maxConferenceParticipants: -1,
            maxTopicLength: -1
        };
    }

    _loadConversations() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATIONS_API)
            .then(messageParser.parseMessagesList);
    }

    loadConversations(type = 'default', page = 0) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.CONFERENCES, {
            type: type,
            p: page
        }).then((full) => full.data).then((conversations) => {
            return conversations.map((conv) => {
                conv.id = parseInt(conv.id);
                return conv;
            });
        });
    }

    _loadFavorites() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_FAVORITES)
            .then(messageParser.parseFavoriteMessages);
    }

    loadMessages(id = 0, beforeMessage = 0, markRead = false) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.MESSAGES, {
            conference_id: id,
            message_id: beforeMessage,
            read: markRead.toString() // Should be string according to API
        }).then((full) => full.data).then((messages) => {
            return messages.map((message) => {
                message.message_id = parseInt(message.message_id);
                message.conference_id = parseInt(message.conference_id);
                message.user_id = parseInt(message.user_id);
                message.timestamp = parseInt(message.timestamp);

                return message;
            });
        });
    }

    markConversationRead(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.MARK_READ, {
            conference_id: id
        });
    }

    markConversationUnread(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.MARK_UNREAD, {
            conference_id: id
        });
    }

    _favoriteMessage(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_MARK_FAVORITE + id)
            .then(messageParser.parseMarkFavorite).then(function(result) {
                result.id = id;
                return result;
            });
    }

    _unfavoriteMessage(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_UNMARK_FAVORITE + id)
            .then(messageParser.parseMarkFavorite).then(function(result) {
                result.id = id;
                return result;
            });
    }

    favoriteMessage(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.FAVORITE, {
            conference_id: id
        });
    }

    unfavoriteMessage(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.UNFAVORITE, {
            conference_id: id
        });
    }

    _blockConversation(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_MARK_BLOCKED + id)
            .then(messageParser.parseMarkBlocked).then(function(result) {
                result.id = id;
                return result;
            });
    }

    _unblockConversation(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_UNMARK_BLOCKED + id)
            .then(messageParser.parseMarkBlocked).then(function(result) {
                result.id = id;
                return result;
            });
    }

    blockConversation(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.BLOCK, {
            conference_id: id
        });
    }

    unblockConversation(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.UNBLOCK, {
            conference_id: id
        });
    }

    _reportConversation(id) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_REPORT + id)
            .then(messageParser.parseReported).then((result) => {
                result.id = id;
                return result;
            });
    }

    reportConversation(id, message) {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.MESSAGES.REPORT,
                form: {
                    conversation_id: id,
                    text: message
                }
            });
        });
    }

    _loadConversation(id) {
        return Promise.join(this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_API + id).then(messageParser.parseConversation),
                this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_PAGE + id).then(messageParser.parseConversationPage),
            (conversation, participants) => {
                conversation.participants = participants;
                return conversation;
            }
        );
    }

    loadConversation(id, markRead = false) {
        return Promise.join(this.loadConversationInfo(id), this.loadMessages(id, 0, markRead),
            (conv_info, messages) => {
                conv_info.messages = messages;
                return conv_info;
            });
    }

    loadConversationInfo(id) {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.CONFERENCE_INFO, {
            conference_id: id
        }).then((full) => full.data).then((info) => {
            info.users = info.users.map((user) => {
                user.uid = parseInt(user.uid);
                return user;
            });
            info.id = parseInt(info.id);
            return info;
        });
    }

    _sendMessage(id, content) {
        return this.session_handler.openRequest(function(request) {
            return request.post({
                url: PROXER_BASE_URL + PROXER_PATHS.MESSAGE_WRITE_API + id,
                form: { message: content }
            });
        }).then(messageParser.parseMessagePostResponse);
    }

    sendMessage(id, content) {
        return this.session_handler.openApiRequest((req) => {
            return req.post({
                url: PROXER_API_BASE_URL + API_PATHS.MESSAGES.WRITE_MESSAGE,
                form: {
                    conference_id: id,
                    text: content
                }
            });
        }).then((full) => full.data);
    }

    _refreshMessages(id, last_id = 0) {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_NEW_API + id + "&mid=" + last_id)
            .then(messageParser.parseNewMessages);
    }

    refreshMessages(_id, lastMessageId) {
        return this.loadMessages(0, lastMessageId);
    }

    _newConference(conference) {
        return this.session_handler.openRequest((request) => {
            return request.post({
                url: PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_NEW_CONFERENCE,
                form: {
                    conferenceText: conference.text,
                    conferenceTopic: conference.title,
                    conferenceUsers: conference.participants
                }
            });
        }).then(messageParser.parseConferenceCreateResponse);
    }

    newConference(conference) {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.MESSAGES.NEW_CONFERENCE,
                form: {
                    users: conference.participants,
                    topic: conference.title,
                    text: conference.text
                }
            });
        }).then((full) => { return { error: full.error, id: full.data }; });
    }

    _newConversation(conversation) {
        return this.session_handler.openRequest((request) => {
            return request.post({
                url: PROXER_BASE_URL + PROXER_PATHS.CONVERSATION_NEW,
                form: {
                    message: conversation.text,
                    username: conversation.recipient
                }
            });
        }).then(messageParser.parseConversationCreateResponse);
    }

    newConversation(conversation) {
        return this.session_handler.openApiRequest((request) => {
            return request.post({
                url: PROXER_API_BASE_URL + API_PATHS.MESSAGES.NEW_CONVERSATION,
                form: {
                    username: conversation.recipient,
                    text: conversation.text
                }
            });
        }).then((full) => { return { error: full.error, id: full.data }; });
    }

    _checkNotifications() {
        return this.session_handler.openRequest(PROXER_BASE_URL + PROXER_PATHS.MESSAGE_NOTIFICATIONS)
            .then(messageParser.parseMessagesNotification);
    }

    retrieveConstants() {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.CONSTANTS)
            .then((full) => full.data)
            .then((officialConstants) => {
                this.constants = {
                    maxTextLength: officialConstants.textCount,
                    conferencePageSize: officialConstants.conferenceLimit,
                    messagesPageSize: officialConstants.messagesLimit,
                    maxConferenceParticipants: officialConstants.userLimit,
                    maxTopicLength: officialConstants.topicCount
                };

                LOG.info("Updating constants to: ", this.constants);
            });
    }
}

module.exports = MessagesHandler;
