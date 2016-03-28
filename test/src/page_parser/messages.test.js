var fs = require('fs');
var messageParser = require('../../../src/page_parser').message;
var moment = require('moment');

describe('message parser', function() {
    var notification = fs.readFileSync('test/fixtures/page_parser/message_notification.html');

    it('should parse the notification properly', function() {
        messageParser.parseMessagesNotification(notification).should.eventually.include({
            date: moment('2016-03-28').unix(),
            username: "kumpelbot",
            id: 109868
        });
    });
});
