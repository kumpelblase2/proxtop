const cheerio = require('cheerio');
const Promise = require('bluebird');
const request = require('request-promise');
const _ = require('lodash');

function extractProxer(options) {
    const $ = cheerio.load(options.page);
    return {
        url: $('source').attr('src'),
        type: 'mp4'
    };
}

function extractMP4Upload(options) {
    const $ = cheerio.load(options.page);
    const source = $('#player_code').html();
    const video = /'file' *: *'(.+)',/m.exec(source);
    if(video) {
        return {
            url: video[1],
            type: 'mp4'
        };
    } else {
        throw "Could not extract.";
    }
}

function extractYourUpload(options) {
    const $ = cheerio.load(options.page);
    const body = $('body').html();
    const video = /file *: *'(.+)',/m.exec(body);
    const referer = /link *: *'(.+embed.+)',/m.exec(body);
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

function extractStreamCloud(options) {
    const $ = cheerio.load(options.page);
    const inputs = $('#login').find('form').serializeArray();
    const form = inputs.reduce(function(prev, curr) {
        prev[curr.name] = curr.value;
        return prev;
    }, {});

    return Promise.delay(12000).then(function() {
        return request({
            method: 'POST',
            url: options.url,
            form: form
        }).then(function(body) {
            const video = /file *: *"(.+)",/m.exec(body);
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

function extractDailymotion(options) {
    const bodyJson = /\(document\.getElementById\(\'player'\), (\{.*\})\);/m.exec(options.page);
    if(!bodyJson) {
        throw "Could not extract."
    }

    const json = JSON.parse(bodyJson[1]);
    const qualities = json.metadata.qualities;
    const availableQualities = _.sortBy(_.filter(Object.keys(qualities), function(key) { return parseInt(key); }));
    const best = qualities[availableQualities[availableQualities.length - 1]][0];
    return {
        url: best.url,
        type: 'mp4'
    };
}

const parser = {
    extractors: {
        'proxer-stream': extractProxer,
        'mp4upload': extractMP4Upload,
        'yourupload': extractYourUpload,
        'streamcloud2': extractStreamCloud,
        'dailymotion': extractDailymotion
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
    return Promise.resolve(options).then(function(opt) {
        return parser.findExtractor(opt.stream)(opt);
    });
};

module.exports = parser;
