const cheerio = require('cheerio');
const Promise = require('bluebird');

const parser = {
    parseInfo: function($) {
        return {
            name: $('.wName').first().text(),
            sub: $('.wLanguage').first().text().toLowerCase(),
            episode: parseInt($('.wEp').first().text())
        }
    },

    parseMirrors: function(main) {
        const text = main.html();
        const match = /streams ?= ?(\[.*\]);/.exec(text);
        return JSON.parse(match[1]);
    },

    parseNextPrevious: function(row) {
        const firstColumn = row.children().first();
        var next = null;
        var prev = null;
        const epRegex = /\/watch\/\d+\/(\d+)\/.+/;
        if(firstColumn.children().length == 1) {
            const first = firstColumn.children().first();
            prev = epRegex.exec(first.attr('href'))[1];
        }

        const nextButton = row.children().next().next().children().first();
        if(/.+\>.+/.test(nextButton.text())) {
            next = epRegex.exec(nextButton.attr('href'))[1];
        }

        return {
            prev: prev,
            next: next
        };
    }
};

parser.parseEpisode = function(page) {
    const self = this;
    return Promise.resolve(page).then(cheerio.load)
        .then(function($) {
            const info = parser.parseInfo($);
            info.streams = parser.parseMirrors($('#main'));
            const navEps = parser.parseNextPrevious($('.no_details').first());
            info.prev = navEps.prev;
            info.next = navEps.next;
            return info;
        });
};

parser.parseEpisodeList = function(page) {
    const self = this;
    return Promise.resolve(page).then(cheerio.load)
        .then(function($) {
            throw "Not implemented.";
        });
};

module.exports = parser;
