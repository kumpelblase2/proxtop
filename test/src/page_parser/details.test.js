var fs = require('fs');
var cheerio = require('cheerio');
var detailsParser = require('../../../src/page_parser').details;

describe('details parser', function() {
    var $ = cheerio.load(fs.readFileSync('test/fixtures/page_parser/details_columns.html'));

    it('should parse the cover', function() {
        detailsParser.parseCover($('#coverdetails1')).should.eql('//cdn.proxer.me/cover/10195.jpg');
        detailsParser.parseCover($('#coverdetails2')).should.eql('//cdn.proxer.me/cover/3248.jpg');
    });

    it('should parse the rating', function() {
        detailsParser.parseRating($('#coverdetails1')).should.eql({
            average: 7.16,
            votes: 1970
        });

        detailsParser.parseRating($('#coverdetails2')).should.eql({
            average: 8.13,
            votes: 1560
        });
    });

    it('should parse the info table', function() {
        detailsParser.parseInfo($, $('#description1')).should.eql({
            name: 'Absolute Duo',
            japanese_name: 'アブソリュート・デュオ',
            english_name: null,
            licensed: false,
            season: {
                start: 'Winter 2015',
                end: 'Winter 2015'
            },
            status: 'finished',
            genres: [
                'Action',
                'Ecchi',
                'Fantasy',
                'Harem',
                'Romance',
                'School',
                'Superpower'
            ],
            description: 'Die Fantasy-Geschichte beginnt mit Blaze – einer Waffe, die die Manifestation einer menschlichen Seele ist. Seltsamerweise besitzt Tōru Kokonoes Blaze nicht die Form einer Waffe, sondern die eines Schildes. Er landet auf einer Schule, die sich auf Kampffähigkeiten spezialisiert hat, und dank des dortigen Duo-Partner-Systems hat er das \'Glück\', mit einem schönen silberhaarigen Mädchen zusammenzuleben. Diese heißt Julie Sigtuna (der Name "Sigtuna" ist eine Anspielung auf die gleichnamige schwedische Stadt) und ist eine Austauschschülerin aus dem nordischen Gimlé (ein Ort aus der nordischen Mythologie).',
            content_warnings: [
                'fsk16'
            ],
            subs: [
                {
                    name: 'Yoru No Hikari',
                    country: 'german'
                },
                {
                    name: 'Peachcake Subs',
                    country: 'german'
                },
                {
                    name: 'Pantsu ga daisuki/Erokawaii',
                    country: 'german'
                },
                {
                    name: 'Grim-Subs',
                    country: 'german'
                }
            ]
        });
    });

    it('should parse the details page properly', function() {

    });
});
