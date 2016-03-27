var _ = require('lodash');
var Promise = require('bluebird');
var cheerio = require('cheerio');

var parser = {
    parseConversationParticipants: function($, participants) {
        var users = [];
        for(var i = 0; i < participants.length; i++) {
            var user = participants[i];
            var children = user.children;
            var image = $(children[1]);
            var userinfo = $(children[3]);

            var username = userinfo.children().first().children().first().html();
            var userid = parseInt(/(\d+)/.exec(userinfo.children().first().attr('href'))[1]);
            var status = userinfo.text().trim().substring(username.length).trim();

            users.push({
                userid: userid,
                username: username,
                avatar: image.children().first().attr('src'),
                status: status
            });
        }
        return users;
    }
};

parser.parseMessagesList = function(page) {
    return Promise.resolve(page).then(JSON.parse)
        .then(function(data) {
            if(data.error) {
                throw new Error(data.msg);
            }
            return data.conferences;
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
                messages: data.messages
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

            return data.messages;
        });
};

module.exports = parser;
