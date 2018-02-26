var fs = require('fs');
var streamParser = require('../../../src/page_parser').stream;

describe('stream parser', function() {
    var page = fs.readFileSync('test/fixtures/page_parser/mp4upload_stream_page.html');

    it('should parse stream from mp4upload', function() {
        const mp4parser = streamParser.findExtractor({type:'mp4upload'});
        const video = mp4parser({page});
        video.should.eql({
            url: "https://www13.mp4upload.com:282/d/q2xscwlez3b4quuow6uqyn2hjnf7zerajabb6dbipactv2zzizdycy4h/video.mp4",
            type: 'mp4'
        });
    });
});
