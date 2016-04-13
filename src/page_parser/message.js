const _ = require('lodash');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const moment = require('moment');

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

            return data.conferences.map((conv) => {
                conv.id = parseInt(conv.id);
                return conv;
            });
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
                messages: data.messages,
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
                messages: data.messages,
                has_more: data.messages.length == 15
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

module.exports = parser;
