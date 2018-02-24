const Storage = require('./storage');
const _ = require('lodash');

const DB_NAME = 'messages';

function filterNull(arr) {
    return arr ? arr.filter((elem) => elem != null) : [];
}

class MessagesStorage extends Storage {
    constructor(db) {
        super(db, DB_NAME);
    }

    saveNewConversation(id, messages = [], topic = "", read = false, participants = [], favorite = false, image = null, last_read = -1) {
        messages = filterNull(messages);

        if(last_read < 0 && messages.length > 0 && read) {
            last_read = messages[messages.length - 1].message_id;
        } else {
            last_read = 0;
        }

        this.storage.push({ id, messages, topic, read, participants, image, favorite, last_read, has_more: true }).write();
    }

    addMessagesOrCreate(id, newMessages) {
        if(!this._hasConversation(id)) {
            this.saveNewConversation(id, newMessages);
            return newMessages;
        } else {
            return this.addMessages(id, newMessages);
        }
    }

    addMessages(id, newMessages, has_more = null) {
        newMessages = filterNull(newMessages);
        const old = this.getConversation(id).messages;
        const diff = _.differenceBy(newMessages, old, 'message_id');
        const total = _.uniqBy(old.concat(newMessages), 'message_id').sort((a, b) => a.message_id - b.message_id);
        let update = this.storage.find({ id }).assign({ messages: total });
        if(has_more != null) {
            update = update.assign({ has_more: has_more });
        }
        update.write();
        return diff;
    }

    markConversationFavorite(id, state = false) {
        this.storage.find({ id }).assign({ favorite: state }).write();
    }

    markConversationRead(id, state = false) {
        this.storage.find({ id }).assign({ read: state }).write();
    }
    markConversationBlocked(id, state = false) {
        this.storage.find({ id }).assign({ blocked: state }).write();
    }

    updateParticipants(id, participants = []) {
        this.storage.find({ id }).assign({ participants }).write();
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
        this.storage.remove().write();
    }

    updateConversation(id, messages = null, topic = null, read = null, participants = null, favorite = null, image = null, last_read = null) {
        let query = this.storage.find({ id });
        if(messages != null) {
            messages = filterNull(messages);
            query = query.assign({ messages });
        }

        if(topic != null) {
            query = query.assign({ topic });
        }

        if(read != null) {
            query = query.assign({ read });
        }

        if(participants != null) {
            query = query.assign({ participants });
        }

        if(favorite != null) {
            query = query.assign({ favorite });
        }

        if(image != null) {
            query = query.assign({ image });
        }

        if(last_read != null) {
            query = query.assign({ last_read });
        }

        query.write();
    }

    addConversationsIfNotExists(conversations) {
        conversations.forEach((conversation) => {
            if(!this._hasConversation(conversation.id)) {
                this.saveNewConversation(conversation.id, [], conversation.topic, conversation.read, [], false, conversation.image, conversation.read_mid);
            } else {
                this.updateConversation(conversation.id, null, conversation.topic, conversation.read, null, null, conversation.image, conversation.read_mid);
            }
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

    _hasConversation(id) {
        return this.getConversation(id) != null;
    }
}

module.exports = MessagesStorage;
