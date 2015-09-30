var cheerio = require('cheerio');
var _ = require('lodash');

/*
RESULT:
{
    name,
    japanese_name,
    german_name,
    type,
    cover,
    genre,
    fsk,
    season,
    status,
    industry,
    lizensing,
    description,
    score
}


*/
function extractRow(row) {
    return row.children().next().text();
}


var parser = {
    parseGenres: function($, row) {
        return row.children().next().find('a').map(function() {
            return $(this).text();
        }).get();
    },

    parseContentRestrictions: function($, row) {
        return row.children().next().find('img').map(function() {
            return /\/images\/fsk\/(.+)\.png/.exec($(this).attr('src'))[1];
        }).get();
    },

    parseSeason: function(row) {
        var seasonText = row.children().next().first().text();
        var match = /Start: (\w+ \d+)(Ende: (\w+ \d+))?/.exec(seasonText);
        return {
            start: match[1],
            end: (match.length == 4 ? match[3] : null)
        };
    },

    parseStatus: function(row) {
        var text = extractRow(row);
        switch(true) {
            case /Abgeschlossen/.test(text):
                return 'finished';
            case /^Airing/.test(text):
                return 'airing';
            default:
                return 'pre-airing';
        }
    },

    parseSubs: function($, row) {
        var content = row.children().next().first();
        if(content.text().indexOf('Keine Gruppen') >= 0) {
            return [];
        }

        var flags = content.find('img.flag');
        var subs = content.find('a');
        return flags.map(function(i) {
            return {
                country: /\/images\/flag\/(\w+)\.gif/.exec($(this).attr('src'))[1],
                name: $(subs[i]).text()
            }
        }).get();
    },

    parseTitle: function(page) {
        return page.find('span.fn').text();
    },

    parseCover: function(page) {
        return page.find('table.no_details img').attr('src');
    },

    parseRating: function(page) {
        var average = parseFloat(page.find('span.average').text());
        var votes = parseInt(page.find('span.votes').text());
        return {
            votes: votes,
            average: average
        }
    },

    parseInfo: function($, page) {
        var table = page.find('table.details').first();
        var rows = table.find('tr');
        var current = rows.first();
        var info = {};
        info.name = extractRow(current);
        current = current.next();
        if(/Eng/.test(current.children().text())) {
            info.english_name = extractRow(current);
            current = current.next();
        } else {
            info.english_name = null;
        }

        if(/Jap/.test(current.children().text())) {
            info.japanese_name = extractRow(current);
            current = current.next();
        } else {
            info.japanese_name = null;
        }

        info.genres = parser.parseGenres($, current);
        current = current.next();
        info.content_warnings = parser.parseContentRestrictions($, current);
        current = current.next();
        info.season = parser.parseSeason(current);
        current = current.next();
        info.status = parser.parseStatus(current);
        current = current.next();
        info.subs = parser.parseSubs($, current);
        current = current.next().next();
        info.licensed = extractRow(current).indexOf('Lizensiert') >= 0;
        current = current.next();
        info.description = current.children().first().text().substring('Beschreibung:'.length).trim();
        return info;
    },

    parseComments: function(page) {

    },

    parseNews: function(page) {

    },
};

parser.parseDetail = function(page) {
    return Promise.resolve(page).then(cheerio.load).then(function($) {

    });
};

module.exports = parser;
