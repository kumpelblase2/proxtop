var fs = require('fs');
var loginParser = require('../../../src/page_parser').login;

describe('login parser', function() {
    it('should parse the page', function() {
        var input = fs.readFileSync('test/fixtures/page_parser/login_page_valid.html');
        return loginParser.parseLogin(input).should.eventually.eql({
            status: 'logged-out',
            data: {
                option: 'com_users',
                task: 'user.login',
                'return': 'Lw==',
                '561bc23a974304c2fe1629b812e9480d': '1',
                remember: 'yes'
            }
        });
    });

    it('should parse the page when logged in', function() {
        var input = fs.readFileSync('test/fixtures/page_parser/login_page_loggedin.html');
        return loginParser.parseLogin(input).should.eventually.eql({
            status: 'logged-in'
        });
    });

    it('should error on bad page', function() {
        var input = fs.readFileSync('test/fixtures/page_parser/login_page_error.html');
        return loginParser.parseLogin(input).should.eventually.eql({
            data: "No form found",
            status: 'error'
        });
    });
});
