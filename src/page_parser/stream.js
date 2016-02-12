var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = require('request-promise');

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

function extractYourUpload($) {
    var body = $('body').html();
    var video = /file *: *'(.+)',/m.exec(body);
    var referer = /link *: *'(.+embed.+)',/m.exec(body);
    if(video) {
        return request({
            url: video[1],
            headers: {
                'Referer': referer[1]
            },
            followRedirect: false
        }).catch(function(e) {
            return {
                url: e.response.headers.location,
                type: 'mp4'
            };
        });
    } else {
        throw "Could not extract.";
    }
}

function extractStreamCloud($, options) {
    var inputs = $('#login').find('form').serializeArray();
    var form = inputs.reduce(function(prev, curr) {
        prev[curr.name] = curr.value;
        return prev;
    }, {});

    return Promise.delay(12000).then(function() {
        return request({
            method: 'POST',
            url: options.url,
            form: form
        }).then(function(body) {
            var video = /file *: *"(.+)",/m.exec(body);
            if(video) {
                return {
                    url: video[1],
                    type: 'mp4'
                };
            } else {
                throw "Could not extract.";
            }
        });
    });
}

var parser = {
    extractors: {
        'proxer-stream': extractProxer,
        'mp4upload': extractMP4Upload,
        'yourupload': extractYourUpload,
        'streamcloud2': extractStreamCloud
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
        .then(function($) {
            return parser.findExtractor(options.stream)($, options);
        });
};

module.exports = parser;
