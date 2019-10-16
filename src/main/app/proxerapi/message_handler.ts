import Log from "../util/log";
import { API_PATHS, PROXER_API_BASE_URL } from "../globals";
import { join } from 'bluebird';
import { constants } from "./constants";
import SessionHandler from "../lib/session_handler";

export default class MessagesHandler {
    session_handler: SessionHandler;

    constructor(sessionHandler: SessionHandler) {
        this.session_handler = sessionHandler;
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
            return request.post(
                PROXER_API_BASE_URL + API_PATHS.MESSAGES.REPORT,
                {
                    form: {
                        conversation_id: id,
                        text: message
                    }
                });
        });
    }

    loadConversation(id, markRead = false) {
        return join(this.loadConversationInfo(id), this.loadMessages(id, 0, markRead),
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
            return req.post(
                PROXER_API_BASE_URL + API_PATHS.MESSAGES.WRITE_MESSAGE,
                {
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
            return request.post(
                PROXER_API_BASE_URL + API_PATHS.MESSAGES.NEW_CONFERENCE, {
                    form: {
                        users: conference.participants,
                        topic: conference.title,
                        text: conference.text
                    }
                });
        }).then((full) => {
            return { error: full.error, id: full.data };
        });
    }

    newConversation(conversation) {
        return this.session_handler.openApiRequest((request) => {
            return request.post(
                PROXER_API_BASE_URL + API_PATHS.MESSAGES.NEW_CONVERSATION, {
                    form: {
                        username: conversation.recipient,
                        text: conversation.text
                    }
                });
        }).then((full) => {
            return { error: full.error, id: full.data };
        });
    }

    retrieveConstants() {
        return this.session_handler.openApiRequest(PROXER_API_BASE_URL + API_PATHS.MESSAGES.CONSTANTS)
            .then((full) => full.data)
            .then((officialConstants) => {
                constants.maxTextLength = officialConstants.textCount;
                constants.conferencePageSize = officialConstants.conferenceLimit;
                constants.messagesPageSize = officialConstants.messagesLimit;
                constants.maxConferenceParticipants = officialConstants.userLimit;
                constants.maxTopicLength = officialConstants.topicCount;

                Log.info("Updating constants to: ", constants);
            })
            .catch(ex => Log.warn(`Could not get constants: ${ex.message}`));
    }
}
