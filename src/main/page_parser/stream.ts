import * as cheerio from 'cheerio';
import * as Promise from "bluebird";
import * as request from 'request-promise';
import * as _ from 'lodash';

export type VideoFormat = "mp4"

export type VideoSource = {
    url: string,
    type: VideoFormat
};

const MP4UPLOAD_TEMPLATE_REGEX = /eval\(function\([^)]+\) *{[^}]+}\((.+)\)/;
const MP4UPLOAD_STRING_REGEX = /'((\\'|[^'])+)'/g;
const MP4UPLOAD_SRC_REGEX = /src:"([^"]+)"/;

function extractProxer(options): Promise<VideoSource> {
    const $ = cheerio.load(options.page);
    const result: VideoSource = {
        url: $('source').attr('src'),
        type: 'mp4'
    };
    return Promise.resolve(result);
}

// This is partly taken from the mp4 page and replaced with better names to understand it.
function mp4UploadScriptGenerator(template, base, counter, dictionary) {
    while(counter--) {
        if(dictionary[counter]) {
            template = template.replace(new RegExp('\\b' + counter.toString(base) + '\\b', 'g'), dictionary[counter]);
        }
    }

    return template;
}

function extractMP4Upload(options): Promise<VideoSource> {
    const $ = cheerio.load(options.page);
    const scripts = $('script');
    let found;
    for(let i = 0; i < scripts.length; i++) {
        if(scripts[i].children.length === 1) {
            const script = scripts[i].children[0].data;
            if(MP4UPLOAD_TEMPLATE_REGEX.test(script)) {
                found = script;
            }
        }
    }

    if(found == null) {
        throw "Could not extract, no matching script found.";
    }

    const parameterMatch = MP4UPLOAD_TEMPLATE_REGEX.exec(found);
    if(parameterMatch == null) {
        throw "Could not extract, full template not found.";
    }

    const parameters = parameterMatch[1];
    const firstParameter = MP4UPLOAD_STRING_REGEX.exec(parameters);
    if(firstParameter == null) {
        throw "Could not extract, no parameter string found (1).";
    }

    const template = firstParameter[1];
    MP4UPLOAD_STRING_REGEX.lastIndex = template.length + 2;
    const lastParameter = MP4UPLOAD_STRING_REGEX.exec(parameters);
    if(lastParameter == null) {
        throw "Could not extract, no parameter string found (2).";
    }

    const dictionary = lastParameter[1];
    // By default we add 2 to each length because of the opening and closing `'`.
    // We offset the start by 1 more so we get rid of the initial `,`
    // This is still not quite perfect, since we're missing a `.split('|')` in the regex, so the numbersString
    // will contain some garbage that we don't need. But whatever.
    const numbersString = parameters.substr(template.length + 3, parameters.length - (template.length + 2 + dictionary.length + 2));
    const numbers = numbersString.split(',');
    if(numbers == null || numbers.length < 2) {
        throw "Could not extract, numbers not found.";
    }

    const base = parseInt(numbers[0].trim());
    const counterStart = parseInt(numbers[1].trim());
    const resultingScript = mp4UploadScriptGenerator(template, base, counterStart, dictionary.split("|"));
    const sourceMatch = MP4UPLOAD_SRC_REGEX.exec(resultingScript);

    if(sourceMatch != null) {
        const stream: VideoSource = {
            url: sourceMatch[1],
            type: 'mp4'
        };
        return Promise.resolve(stream);
    } else {
        throw "Could not extract, missing source.";
    }
}

function extractYourUpload(options): Promise<VideoSource> {
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

function extractStreamCloud(options): Promise<VideoSource> {
    const $ = cheerio.load(options.page);
    const inputs = $('#login').find('form').serializeArray();
    const form = inputs.reduce(function(prev, curr) {
        prev[curr.name] = curr.value;
        return prev;
    }, {});

    return Promise.delay(12000).then(() => {
        return request({
            method: 'POST',
            url: options.url,
            form: form
        }).then((body) => {
            const video = /file *: *"(.+)",/m.exec(body);
            if(video) {
                return {
                    url: video[1],
                    type: 'mp4'
                } as VideoSource;
            } else {
                throw "Could not extract.";
            }
        });
    });
}

function extractDailymotion(options): Promise<VideoSource> {
    const bodyJson = /\(document\.getElementById\('player'\), ({.*})\);/m.exec(options.page);
    if(!bodyJson) {
        throw "Could not extract."
    }

    const json = JSON.parse(bodyJson[1]);
    const qualities = json.metadata.qualities;
    const allQualities = Object.keys(qualities);
    const numberedQualities: string[] = _.filter(allQualities, (quality: string) => !!parseInt(quality));
    const availableQualities = _.sortBy(numberedQualities);
    const best = qualities[availableQualities[availableQualities.length - 1]][0];
    const stream: VideoSource = {
        url: best.url,
        type: 'mp4'
    };
    return Promise.resolve(stream);
}

const extractors: { [name: string]: (object) => Promise<VideoSource> } = {
    'proxer-stream': extractProxer,
    'mp4upload': extractMP4Upload,
    'yourupload': extractYourUpload,
    'streamcloud2': extractStreamCloud,
    'dailymotion': extractDailymotion
};

export function findExtractor(stream): (object) => Promise<VideoSource> {
    if(extractors[stream.type]) {
        return extractors[stream.type];
    } else {
        return () => {
            throw "Cannot find extractor for type " + stream.type;
        };
    }
}

export function parseVideo(options): Promise<VideoSource> {
    return Promise.resolve(options).then((opt) => {
        return findExtractor(opt.stream)(opt);
    });
}
