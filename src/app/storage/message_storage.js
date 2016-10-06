const Storage = require('./storage');
const _ = require('lodash');

const DB_NAME = 'messages';

class MessagesStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }

    saveNewConversation(id, messages, topic = "", read = false, participants = [], favorite = false, image = null) {
        this.storage.push({ id, messages, topic, read, participants, image, favorite, has_more: true, last_page: 0 }).value();
    }

    addMessages(id, newMessages, has_more) {
        const old = this.getConversation(id).messages;
        const total = _.uniqBy(old.concat(newMessages), 'id').sort((a, b) => a.id - b.id);
        let update = this.storage.find({ id }).assign({ messages: total });
        if(typeof(has_more) !== 'undefined') {
            update = update.assign({ has_more: has_more });
        }
        update.value();
    }

    addPage(id, newMessages, has_more = true, page = 0) {
        this.addMessages(id, newMessages, has_more);
        const lastPage = page <= 0 ? this.getConversation(id).last_page + 1 : page;
        this.storage.find({ id }).assign({ last_page: lastPage }).value();
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

    hasMore(id) {
        const conversation = this.getConversation(id);
        return conversation && conversation.has_more;
    }

    getLastMessage(id) {
        const conv = this.getConversation(id);
        if(conv) {
            return conv.messages[conv.messages.length - 1];
        } else {
            return null;
        }
    }
}

module.exports = MessagesStorage;