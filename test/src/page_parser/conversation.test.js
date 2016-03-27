var fs = require('fs');
var conversationParser = require('../../../src/page_parser').message;

describe('conversation parser', function() {
    var page = fs.readFileSync('test/fixtures/page_parser/conversation_users.html');

    it('should parse the participants properly', function() {
        conversationParser.parseConversationPage(page).should.eventually.include({
            userid: 137974,
            username: "kumpelblase2",
            avatar: "//cdn.proxer.me/avatar/tn/137974_54fa117610568.jpg",
            status: "I just want to be liked"
        });
        conversationParser.parseConversationPage(page).should.eventually.include({
            userid: 523731,
            username: "kumpelbot",
            avatar: "//cdn.proxer.me/avatar/tn/nophoto.png",
            status: ""
        });
    });
});
