const _ = require('lodash');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const moment = require('moment');

function sanitizeConversation(json) {
    const { id, topic, count, conference, timestamp_end, read, image } = json;
    return {
        id: parseInt(id),
        topic,
        image,
        last_timestamp: timestamp_end,
        participant_count: parseInt(count),
        is_conference: conference === "1",
        read: read === "1"
    };
}

function sanitizeMessage(json) {
    const { id, fromid, message, action, timestamp, device, username, avatar, block } = json;
    return {
        id: parseInt(id),
        message,
        timestamp,
        device,
        sender: {
            id: fromid,
            username: username,
            avatar: avatar,
            blocked: block === "1"
        },
        action: action && action.length() > 0 ? action : null
    }
}

const parser = {
    parseConversationParticipants: function($, participants) {
        const users = [];
        for(var i = 0; i < participants.length; i++) {
            const user = participants[i];
            const children = user.children;
            const image = $(children[1]);
            const userinfo = $(children[3]);

            const username = userinfo.children().first().children().first().html();
            const userid = parseInt(/(\d+)/.exec(userinfo.children().first().attr('href'))[1]);
            const status = userinfo.text().trim().substring(username.length).trim();

            users.push({
                userid: userid,
                username: username,
                avatar: image.children().first().attr('src'),
                status: status
            });
        }
        return users;
    },

    parseConversationItems: function($, items, format) {
        const conversations = [];

        for(var i = 0; i < items.length; i++) {
            const username = $(items[i].children[3]).text();
            const date = $(items[i].children[5]).text();
            const id = parseInt(/.+id=(\d+)/.exec($(items[i]).attr('href'))[1]);

            conversations.push({
                username: username,
                date: moment(date, format).unix(),
                id: id
            });
        }

        return conversations;
    }
};

parser.parseMessagesList = function(page) {
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }

            return data.conferences.map(sanitizeConversation);
        });
};

parser.parseNewMessages = function(page) {
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }

            return {
                conversation_id: data.uid,
                messages: data.messages.map(sanitizeMessage),
                has_more: data.messages.length == 15
            };
        });
};

parser.parseMessagePostResponse = function(page) {
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }

            return {
                conversation_id: data.uid,
                message: data.msg
            };
        });
};

parser.parseConversationPage = function(page) {
    return Promise.resolve(page).then(cheerio.load).then(function($) {
        return parser.parseConversationParticipants($, $('#conferenceUsers .message_item'));
    });
};

parser.parseConversation = function(page) {
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }

            return {
                messages: data.messages.map(sanitizeMessage),
                has_more: data.messages.length == 15,
                favorite: data.favour == "1",
                blocked: data.block == "1"
            };
        });
};

parser.parseMessagesNotification = function(page) {
    return Promise.resolve(page).then(cheerio.load).then(function($) {
        return parser.parseConversationItems($, $('a.conferenceList'), "DD.MM.YYYY");
    });
};

parser.parseFavoriteMessages = function(page) {
    return Promise.resolve(page).then(cheerio.load).then(($) => {
        return parser.parseConversationItems($, $('a.conferenceGrid'), "DD.MM.YYYY HH:mm");
    });
};

parser.parseMarkFavorite = function(page) {
    return Promise.resolve(page).then(JSON.parse);
};

parser.parseMarkBlocked = function(page) {
    return Promise.resolve(page).then(JSON.parse);
};

parser.parseReported = (page) => {
    return Promise.resolve({}); //TODO: just ignoring for now, haven't seen the proper result as I haven't actually reported anyone...
};

parser.parseConferenceCreateResponse = (page) => {
    return Promise.resolve(page).then(JSON.parse);
};

parser.parseConversationCreateResponse = (page) => {
    return Promise.resolve(page).then(JSON.parse);
};

module.exports = parser;
