var fs = require('fs');
var cheerio = require("cheerio");
var episodeParser = require('../../../src/page_parser').episode;

describe('episode parser', function() {
    it('should parse the page', function() {
        var input = fs.readFileSync('test/fixtures/page_parser/episode_page.html');
        return episodeParser.parseEpisode(input).should.eventually.eql({
            episode: 1,
            name: "Test123",
            prev: null,
            next: "2",
            streams: [
                {
                    "code": "m6oy3h6t8i6v",
                    "htype": "iframe",
                    "id": "565408",
                    "img": "mp4upload.png",
                    "legal": "0",
                    "name": "MP4Upload",
                    "parts": "0",
                    "replace": "http://www.mp4upload.com/embed-#.html",
                    "ssl": "0",
                    "text": "",
                    "tid": "140",
                    "tname": "Anime-Subs",
                    "type": "mp4upload",
                    "uploader": "518430",
                    "username": "Destroyer123"
                }
            ],
            sub: "gersub"
        });
    });

    it('should parse the info', function() {
        var twoRows = fs.readFileSync('test/fixtures/page_parser/episode_info.html');
        var first = cheerio.load(cheerio.load(twoRows)('#first').html());
        var second = cheerio.load(cheerio.load(twoRows)('#second').html());

        var result = episodeParser.parseInfo(first);
        result.should.eql({
            episode: 1,
            name: "Test123",
            sub: "gersub"
        });

        result = episodeParser.parseInfo(second);
        result.should.eql({
            episode: 1,
            name: "Test123",
            sub: "gerdub"
        });
    });

    it('should parse the streams', function() {
        var $ = cheerio.load(fs.readFileSync('test/fixtures/page_parser/episode_streams.html'));
        var first = $('#first');
        var second = $('#second');

        var result = episodeParser.parseMirrors(first);
        result.should.eql([
            {
                "id":"340633",
                "code":"nzaswjt4yjw5",
                "type":"mp4upload",
                "htype":"iframe",
                "name":"MP4Upload",
                "replace":"http://www.mp4upload.com/embed-#.html",
                "img":"mp4upload.png",
                "parts":"0",
                "ssl":"0",
                "text":"",
                "legal":"0",
                "uploader":"209067",
                "username":"sempiternal",
                "tid":null,
                "tname":null
            },
            {
                "id":"195639",
                "code":"4f4d574b94edb",
                "type":"videoweed",
                "htype":"iframe",
                "name":"VideoWeed",
                "replace":"http://embed.videoweed.es/embed.php?v=#&width=728&height=504",
                "img":"videoweed.png",
                "parts":"1",
                "ssl":"0",
                "text":"",
                "legal":"0",
                "uploader":"48298",
                "username":"Otaku2711",
                "tid":null,
                "tname":null
            }
        ]);

        result = episodeParser.parseMirrors(second);
        result.should.eql([
            {
                "id":"313606",
                "code":"fljbuap46z0k",
                "type":"proxer-stream",
                "htype":"iframe",
                "name":"Proxer-Stream",
                "replace":"http://stream.proxer.me/embed-#-728x504.html",
                "img":"proxer-stream.png",
                "parts":"1",
                "ssl":"0",
                "text":"",
                "legal":"0",
                "uploader":"29185",
                "username":"Dravorle",
                "tid":"21",
                "tname":"Newgene Fansubs"
            },
            {
                "id":"301798",
                "code":"lFlC9Ww2p5",
                "type":"hellsmedia",
                "htype":"iframe",
                "name":"Hellsmedia",
                "replace":"http://hellsmedia.com/embed/#",
                "img":"hellsmedia.png",
                "parts":"0",
                "ssl":"0",
                "text":"",
                "legal":"0",
                "uploader":"68599",
                "username":"BlackLight",
                "tid":null,
                "tname":null
            },
            {
                "id":"146216",
                "code":"rhlpybdgd5jth",
                "type":"novamov",
                "htype":"iframe",
                "name":"Novamov",
                "replace":"http://embed.novamov.com/embed.php?width=728&height=504&v=#&px=1",
                "img":"novamov.png",
                "parts":"1",
                "ssl":"0",
                "text":"",
                "legal":"0",
                "uploader":"100442",
                "username":"Byuka",
                "tid":null,
                "tname":null
            },
            {
                "id":"195485",
                "code":"http://streamcloud.eu/c6nkkudgwi19/Baka_to_Test_to_Shoukanjuu_13.mp4.html",
                "type":"streamcloud",
                "htype":"link",
                "name":"Streamcloud",
                "replace":"",
                "img":"streamcloud.png",
                "parts":"1",
                "ssl":"1",
                "text":"",
                "legal":"0",
                "uploader":"45624",
                "username":"lAcelDEl",
                "tid":null,
                "tname":null
            }
        ]);
    });

    it('should parse the prev/next buttons', function() {
        var $ = cheerio.load(fs.readFileSync('test/fixtures/page_parser/episode_next_prev.html'));
        var first = $('#first');
        var second = $('#second');
        var third = $('#third');

        var result = episodeParser.parseNextPrevious(first);
        result.should.eql({
            next: null,
            prev: "12"
        });

        result = episodeParser.parseNextPrevious(second);
        result.should.eql({
            next: "2",
            prev: null
        });

        result = episodeParser.parseNextPrevious(third);
        result.should.eql({
            next: "3",
            prev: "1"
        });
    });
});
