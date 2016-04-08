var fs = require('fs');
var messageParser = require('../../../src/page_parser').message;
var moment = require('moment');

describe('message parser', function() {
    var notification = fs.readFileSync('test/fixtures/page_parser/message_notification.html');
    var favorites = fs.readFileSync('test/fixtures/page_parser/favorite_conversations.html');

    it('should parse the notification properly', function() {
        messageParser.parseMessagesNotification(notification).should.eventually.include({
            date: moment('2016-03-28').unix(),
            username: "kumpelbot",
            id: 109868
        });
    });

    it('should parse favorite conversations', function() {
        messageParser.parseFavoriteMessages(favorites).should.eventually.include({
            date: moment('2016-04-04 17:58').unix(),
            username: "kumpelbot",
            id: 109868
        });
    });
});
