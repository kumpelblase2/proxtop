var cheerio = require('cheerio');
var Promise = require('bluebird');

function extractProxer($) {
    return {
        url: $('source').attr('src'),
        type: 'mp4'
    };
}

function extractMP4Upload($) {
    var source = $('#player_code').html();
    var video = /'file' *: *'(.+)',/m.exec(source);
    if(video) {
        return {
            url: video[1],
            type: 'mp4'
        };
    } else {
        throw "Could not extract.";
    }
}

var parser = {
    extractors: {
        'proxer-stream': extractProxer,
        'mp4upload': extractMP4Upload
    },
    findExtractor: function(stream) {
        if(this.extractors[stream.type]) {
            return parser.extractors[stream.type];
        } else {
            return function() {
                throw "Cannot find extractor for type " + stream.type;
            };
        }
    }
};

parser.parseVideo = function(options) {
    return Promise.resolve(options.page).then(cheerio.load)
        .then(parser.findExtractor(options.stream));
};

module.exports = parser;
