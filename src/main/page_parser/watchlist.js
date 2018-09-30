import cheerio from "cheerio";
import Promise from "bluebird";

const parser = {
    parseAiringColumn: function(column) {
        return column.children('img').attr('title') === 'Airing';
    },

    parseNameColumn: function(column) {
        const content = column.children('a');
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
    },

    parseEntryId: function(row) {
        return parseInt(row.attr('id').substr(5));
    }
};

parser.parseRow = function(row) {
    const title = {};
    let current = row.children().first();
    title.airing = parser.parseAiringColumn(current);
    current = current.next();
    const name = parser.parseNameColumn(current);
    title.name = name.name;
    title.id = name.id;
    title.url = name.url;
    current = current.next();
    title.episode = parser.parseEpisodeColumn(current);
    current = current.next();
    title.sub = parser.parseSubColumn(current);
    current = current.next().next();
    title.status = parser.parseStatusColumn(current);
    title.entry = parser.parseEntryId(row);
    return title;
};

parser.extractFromTable = function($, table) {
    const result = {};
    const title = table.parent().children().first().text();
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
        const tables = $('table#box-table-a');
        const data = {};
        tables.each(function(i, elem) {
            const result = parser.extractFromTable($, $(elem));
            if(result) {
                data[result.type] = result.contents;
            }
        });

        data.anime = data.anime || [];
        data.manga = data.manga || [];

        return data;
    });
};

parser.parseUpdateReponse = function(response) {
    return Promise.resolve(response).then(JSON.parse);
};

parser.parseFinishResponse = function(response) {
    return Promise.resolve(response).then(JSON.parse);
};

parser.parseDeleteResponse = parser.parseUpdateReponse;

export default parser;
