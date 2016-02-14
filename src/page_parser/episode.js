var cheerio = require('cheerio');
var Promise = require('bluebird');

var parser = {
    parseInfo: function($) {
        return {
            name: $('.wName').first().text(),
            sub: $('.wLanguage').first().text().toLowerCase(),
            episode: parseInt($('.wEp').first().text())
        }
    },

    parseMirrors: function(main) {
        var text = main.html();
        var match = /streams ?= ?(\[.*\]);/.exec(text);
        return JSON.parse(match[1]);
    },

    parseNextPrevious: function(row) {
        var firstColumn = row.children().first();
        var next = null;
        var prev = null;
        var epRegex = /\/watch\/\d+\/(\d+)\/.+/;
        if(firstColumn.children().length == 1) {
            var first = firstColumn.children().first();
            prev = epRegex.exec(first.attr('href'))[1];
        }

        var nextButton = row.children().next().next().children().first();
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
    var self = this;
    return Promise.resolve(page).then(cheerio.load)
        .then(function($) {
            var info = parser.parseInfo($);
            info.streams = parser.parseMirrors($('#main'));
            var navEps = parser.parseNextPrevious($('.no_details').first());
            info.prev = navEps.prev;
            info.next = navEps.next;
            return info;
        });
};

parser.parseEpisodeList = function(page) {
    var self = this;
    return Promise.resolve(page).then(cheerio.load)
        .then(function($) {
            throw "Not implemented.";
        });
};

module.exports = parser;
