var cheerio = require('cheerio');
var Promise = require('bluebird');
var _ = require('lodash');

var parser = {
    parseAiringColumn: function(column) {
        return column.children('img').attr('title') === 'Airing';
    },

    parseNameColumn: function(column) {
        var content = column.children('a');
        return {
            name: content.text(),
            id: parseInt(content.attr('title').split(':')[1], 10),
            url: content.attr('href')
        };
    },

    parseEpisodeColumn: function(column) {
        return parseInt(column.text());
    },

    parseSubColumn: function(column) {
        return column.text().toLowerCase();
    },

    parseStatusColumn: function(column) {
        return /online/.test(column.children('img').attr('src'));
    }
};

parser.parseRow = function(row) {
    var title = {};
    var current = row.children().first();
    title.airing = parser.parseAiringColumn(current);
    current = current.next();
    var name = parser.parseNameColumn(current);
    title.name = name.name;
    title.id = name.id;
    title.url = name.url;
    current = current.next();
    title.episode = parser.parseEpisodeColumn(current);
    current = current.next();
    title.sub = parser.parseSubColumn(current);
    current = current.next().next();
    title.status = parser.parseStatusColumn(current);
    return title;
};

parser.extractFromTable = function($, table) {
    var result = {};
    var title = table.parent().children().first().text();
    if(title.indexOf('Anime') >= 0) {
        result.type = 'anime';
    } else if(title.indexOf('Manga') >= 0) {
        result.type = 'manga';
    } else {
        return null;
    }

    result.contents = [];
    table.find('tr').each(function(i, row) {
        if($(row).attr('id') == null) {
            return;
        }

        result.contents.push(parser.parseRow($(row)));
    });

    return result;
};

parser.parseWatchlist = function(page) {
    return Promise.resolve(page).then(cheerio.load).then(function($) {
        var tables = $('table#box-table-a');
        var data = {};
        tables.each(function(i, elem) {
            var result = parser.extractFromTable($, $(elem));
            if(result) {
                data[result.type] = result.contents;
            }
        });
        return data;
    });
};

parser.parseUpdateReponse = function(response) {
    return Promise.resolve(response).then(JSON.parse);
};

module.exports = parser;
