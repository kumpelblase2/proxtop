const Storage = require('./storage');

const DB_NAME = 'messages';

class MessagesStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }

    saveNewConversation(id, messages, topic = "", read = false, participants = [], favorite = false, image = null) {
        this.storage.push({ id, messages, topic, read, participants, image, favorite, has_more: true }).value();
    }

    addMessages(id, newMessages, has_more = true) {
        const old = this.getConversation(id).messages;
        const total = old.concat(newMessages).sort((a, b) => parseInt(a.id) - parseInt(b.id));
        this.storage.find({ id }).assign({ messages: total, has_more }).value();
    }

   markConversationFavorite(id, state = false) {
        this.storage.find({ id }).assign({ favorite: state }).value();
    }

    markConversationRead(id, state = false) {
        this.storage.find({ id }).assign({ read: state }).value();
    }
    markConversationBlocked(id, state = false) {
        this.storage.find({ id }).assign({ blocked: state }).value();
    }

    updateParticipants(id, participants = []) {
        this.storage.find({ id }).assign({ participants }).value();
    }

    hasRead(id) {
        return this.storage.find({ id }).value().read;
    }

    getConversation(id) {
        return this.storage.find({ id }).value();
    }

    getAllConversations() {
        return this.storage.value() || [];
    }

    clearConversations() {
        this.storage.remove().value();
    }

    updateConversation(id, messages, topic = "", read = false, participants = [], favorite = false, image = null) {
        if(this.storage.find({ id }).size().value() > 0) {
            this.storage.find({ id }).assign({ messages, topic, read, participants, favorite, image });
        } else {
            this.saveNewConversation(id, messages, topic, read, participants, favorite, image);
        }
    }

    addConversationsIfNotExists(conversations) {
        conversations.forEach((conversation) => {
            this.updateConversation(conversation.id, [], conversation.topic, conversation.read, [], false, conversation.image);
        });
    }
}

module.exports = MessagesStorage;