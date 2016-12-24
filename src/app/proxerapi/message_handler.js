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

    refreshMessages(_id, lastMessageId) {
        return this.loadMessages(0, lastMessageId);
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
