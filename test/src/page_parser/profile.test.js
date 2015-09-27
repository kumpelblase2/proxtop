var fs = require('fs');
var cheerio = require('cheerio');
var moment = require('moment');
var profileParser = require('../../../src/page_parser').profile;

describe('profile parser', function() {
    var $ = cheerio.load(fs.readFileSync('test/fixtures/page_parser/profile_columns.html'));

    describe('data parsers', function() {
        it('should parse the name', function() {
            profileParser.parseUserName($('#name1')).should.eql('kumpelblase2');
            profileParser.parseUserName($('#name2')).should.eql('genesis');
        });

        it('should parse ranking info' ,function() {
            profileParser.parseRankingColumn($('#rank1')).should.eql({
                anime: 612,
                manga: 46,
                uploads: 0,
                forum: 307,
                wiki: 0,
                additional: 0,
                total: 965,
                title: 'Jonin Two'
            });
        });

        it('should parse online status', function() {
            profileParser.parseOnlineColumn($('#online1')).should.eql(true);
            profileParser.parseOnlineColumn($('#online2')).should.eql(false);
        });

        it('should parse member since', function() {
            // For some reason new Date() uses 0 based months ...
            profileParser.parseMemberSinceColumn($('#member1')).should.eql(new Date(2015, 0, 1, 0, 0, 0, 0).getTime() / 1000);
            profileParser.parseMemberSinceColumn($('#member2')).should.eql(new Date(2009, 11, 15, 0, 0, 0, 0).getTime() / 1000);
            profileParser.parseMemberSinceColumn($('#member3')).should.eql(new Date(2012, 08, 23, 0, 0, 0, 0).getTime() / 1000);
        });

        it('should parse last online', function() {
            profileParser.parseLastOnlineColumn($('#lastonline1')).should.eql(moment().subtract(4, 'hours').unix());
            profileParser.parseLastOnlineColumn($('#lastonline2')).should.eql(moment().subtract(3, 'days').unix());
            profileParser.parseLastOnlineColumn($('#lastonline3')).should.eql(moment().subtract(12, 'minutes').unix());
        });

        it('should parse last update', function() {
            profileParser.parseLastUpdateColumn($('#lastupdate1')).should.eql(moment().subtract(28, 'days').unix());
            profileParser.parseLastUpdateColumn($('#lastupdate2')).should.eql(moment().subtract(10, 'minutes').unix());
            profileParser.parseLastUpdateColumn($('#lastupdate3')).should.eql(moment().subtract(3, 'hours').unix());
        });

        it('should parse status', function() {
            profileParser.parseStatusColumn($('#status1')).should.eql({
                message: 'some status',
                written: moment().subtract(2, 'days').unix()
            });

            profileParser.parseStatusColumn($('#status2')).should.eql({
                message: 'some other status',
                written: moment().subtract(3, 'hours').unix()
            });
        });

        it('should parse contact info', function() {
            profileParser.parseContactColumn($('#contact1')).should.eql(false);
            profileParser.parseContactColumn($('#contact2')).should.eql(true);
        });
    });

    it('should parse the profile page', function() {
        var result = profileParser.parseProfile(fs.readFileSync('test/fixtures/page_parser/profile_page.html'));
        return result.should.eventually.eql({
            self: true,
            name: 'kumpelblase2',
            picture: '/images/comprofiler/137974_54fa117610568.jpg',
            ranking: {
                title: 'Spezial-Anbu',
                total: 1608,
                anime: 1038,
                manga: 59,
                uploads: 0,
                forum: 9,
                wiki: 2,
                additional: 500
            },
            online: true,
            member_since: new Date(2012, 8, 23, 0, 0, 0).getTime() / 1000,
            last_online: moment().subtract(5, 'hours').unix(),
            last_update: moment().subtract(3, 'days').unix(),
            status: {
                message: 'Beep beep.',
                written: moment().subtract(11, 'months').unix()
            },
            allow_friends: true
        });
    });

    it('should parse the profile page of someone else', function() {
        var result = profileParser.parseProfile(fs.readFileSync('test/fixtures/page_parser/profile_page_nocontact.html'));
        return result.should.eventually.eql({
            self: false,
            name: 'genesis',
            picture: '/images/comprofiler/62_55e0bab8915f5.jpg',
            ranking: {
                title: 'Otaku no sensei',
                total: 12548,
                anime: 5216,
                manga: 1883,
                uploads: 3078,
                forum: 1953,
                wiki: 418,
                additional: 0
            },
            online: true,
            member_since: new Date(2009, 11, 15, 0, 0, 0).getTime() / 1000,
            last_online: moment().subtract(3, 'hours').unix(),
            last_update: moment().subtract(29, 'days').unix(),
            status: {
                message: 'Klausurphase, verspätete Antworten~',
                written: moment().subtract(56, 'days').unix()
            },
            allow_friends: false
        });
    });

    it('should parse the profile page of someone without status', function() {
        var result = profileParser.parseProfile(fs.readFileSync('test/fixtures/page_parser/profile_page_nostatus.html'));
        return result.should.eventually.eql({
            self: false,
            name: 'Butts',
            picture: '/images/comprofiler/123.jpg',
            ranking: {
                title: 'Ninja Meister',
                total: 5668,
                anime: 4502,
                manga: 255,
                uploads: 40,
                forum: 871,
                wiki: 0,
                additional: 0
            },
            online: false,
            member_since: new Date(2010, 8, 1, 0, 0, 0).getTime() / 1000,
            last_online: moment().subtract(20, 'days').unix(),
            last_update: moment().subtract(2, 'years').unix(),
            status: null,
            allow_friends: true
        });
    });
});
