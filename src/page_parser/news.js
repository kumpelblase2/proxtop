var cheerio = require('cheerio');
var Promise = require('bluebird');
var moment = require('moment');

function parseTime(date, time) {
    return moment(date + moment().year() + ' ' + time, "DD.MM.YYYY HH:mm").unix();
}

var parser = {
    parseNews: function(page) {
        var news = [];

        var current = page.children();
        while(current.length > 0) {
            var elem = current.first();
            if(elem.hasClass('news')) {
                news.push(parser.parseEntry(elem.children()));
            }

            current = current.next();
        }

        return news;
    },

    parseEntry: function(elements) {
        var image = elements.first().css('background-image');
        image = 'https:' + /url\((.+)\)/.exec(image)[1];
        var content = elements.next();
        var title = content.find('.news_title a');
        title = {
            text: title.text(),
            link: title.attr('href')
        };
        var info = content.find('.news_info');
        var stats = /(\d{2}\.\d{2}\.) (\d{2}:\d{2}) - (\d+) Kommentare - (\d+)/i.exec(info.text());
        stats = {
            timestamp: parseTime(stats[1], stats[2]),
            comments: parseInt(stats[3]),
            views: parseInt(stats[4])
        };
        var infoLinks = info.find('a');
        var category = infoLinks.first();
        category = {
            name: category.text(),
            link: category.attr('href')
        };
        var author = infoLinks.next();
        author = {
            name: author.text(),
            link: author.attr('href')
        };

        var text = content.find('.news_text').text();

        return {
            title: title,
            stats : stats,
            category : category,
            author: author,
            content: text,
            image: image
        };
    }
};

parser.parseNewsPage = function(page) {
    var self = this;
    return Promise.resolve(page).then(cheerio.load)
        .then(function($) {
            return parser.parseNews($('#news'));
        });
};

module.exports = parser;
