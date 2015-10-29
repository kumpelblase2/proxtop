var cheerio = require('cheerio');
var moment = require('moment');

function proxerDateToTimestamp(time) {
    if(time === 'Jetzt') {
        return moment().unix();
    }
    var match = /(\d+) (\w+)/.exec(time);
    var time = parseInt(match[1]);
    var unit = toEnglishUnit(match[2]);
    return moment().subtract(time, unit).unix();
}

function toEnglishUnit(unit) {
    switch(unit.toLowerCase()) {
        case "tag":
            return "days";
        case "minut":
            return "minutes";
        case "stund":
            return "hours";
        case "sekund":
            return "seconds";
        case "monat":
            return "months";
        case "jahr":
            return "years";
        default:
            return "";
    }
}


var parser = {
    parseSelf: function(top) {
        return /dein Profil/.test(top.text());
    },

    parseProfileTable: function(table) {
        var rows = table.find('tr');
        var current = rows.first();
        var info = {
            ranking: parser.parseRankingColumn(current),
            online: parser.parseOnlineColumn((current = current.next())),
            member_since: parser.parseMemberSinceColumn((current = current.next())),
            last_online: parser.parseLastOnlineColumn((current = current.next())),
            last_update: parser.parseLastUpdateColumn((current = current.next()))
        };

        var status = parser.parseStatusColumn(current.next());
        if(typeof(status) === 'undefined' || status == null) {
            info.allow_friends = parser.parseContactColumn(current.next());
            info.status = parser.parseStatusColumn(current.next().next());
        } else {
            info.allow_friends = true;
            info.status = status;
        }

        return info;
    },

    parseUserInfo: function(title) {
        var elem = title.find('a');
        return {
            name: elem.text(),
            id: parseInt(/(\d+)/.exec(elem.attr('href'))[1])
        };
    },

    parseMemberSinceColumn: function(row) {
        var date = row.children().next().text();
        return moment(date, 'DD.MM.YYYY').unix();
    },

    parseRankingColumn: function(row) {
        var text = row.children().next().text();
        var match = /Anime: (\d+).+Manga: (\d+).*Uploads: (\d+).*Forum: (\d+).*Wiki: (\d+).*Zsp\.: (\d+).*Summe: (\d+).*- ([\w -]+)\[\?\]/.exec(text)
        return {
            anime: parseInt(match[1]),
            manga: parseInt(match[2]),
            uploads: parseInt(match[3]),
            forum: parseInt(match[4]),
            wiki: parseInt(match[5]),
            additional: parseInt(match[6]),
            total: parseInt(match[7]),
            title: match[8]
        };
    },

    parseOnlineColumn: function(row) {
        return /online/.test(row.find('img').attr('src'));
    },

    parseLastOnlineColumn: function(row) {
        return proxerDateToTimestamp(row.children().next().text());
    },

    parseLastUpdateColumn: function(row) {
        return proxerDateToTimestamp(row.children().next().text());
    },

    parseStatusColumn: function(row) {
        var status = row.find('td[align=center]');
        var text = "";
        if(status.find('#whatrustatus').length > 0) {
            text = status.find('#whatrustatus').text();
        } else {
            text = status.find('div').text();
        }

        var lastDashIndex = text.lastIndexOf(' - ');
        if(lastDashIndex < 0) {
            return null;
        }
        var message = text.substring(0, lastDashIndex);
        var time = text.substring(lastDashIndex + 1);
        return {
            message: message,
            written: proxerDateToTimestamp(time)
        }
    },

    parseContactColumn: function(row) {
        return row.find('#addFriend').length == 1;
    },

    parseProfilePicture: function(table) {
        return table.find('tr').next().children().next().find('img').attr('src');
    }
};

parser.parseProfile = function(page) {
    return Promise.resolve(page).then(cheerio.load).then(function($) {
        var userinfo = parser.parseUserInfo($('.inner h3'));
        var self = parser.parseSelf($('#profileTop'));
        var info = parser.parseProfileTable($('.profile'));
        var image = parser.parseProfilePicture($('.inner table').first());
        info.name = userinfo.name;
        info.id = userinfo.id;
        info.picture = image;
        info.self = self;
        return info;
    });
};

module.exports = parser;
