import cheerio from "cheerio";
import moment from "moment";

function proxerDateToTimestamp(time) {
    time = time.trim();
    if(time === 'Jetzt') {
        return moment().unix();
    } else if(time === 'Nie') {
        return 0;
    }
    const match = /(\d+) (\w+)/.exec(time);
    time = parseInt(match[1]);
    const unit = toEnglishUnit(match[2]);
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


const parser = {
    parseSelf: function(top) {
        return /dein Profil/.test(top.text());
    },

    parseProfileTable: function(table) {
        const rows = table.find('tr');
        let current = rows.first();
        const info = {
            ranking: parser.parseRankingColumn(current),
            online: parser.parseOnlineColumn((current = current.next())),
            member_since: parser.parseMemberSinceColumn((current = current.next())),
            last_online: parser.parseLastOnlineColumn((current = current.next())),
            last_update: parser.parseLastUpdateColumn((current = current.next()))
        };

        const status = parser.parseStatusColumn(current.next());
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
        const elem = title.find('a');
        return {
            name: elem.text(),
            id: parseInt(/(\d+)/.exec(elem.attr('href'))[1])
        };
    },

    parseMemberSinceColumn: function(row) {
        const date = row.children().next().text();
        return moment(date, 'DD.MM.YYYY').unix();
    },

    parseRankingColumn: function(row) {
        const text = row.children().next().text();
        const split = text.split('|').map(s => s.trim());
        const first = split.slice(0, 5);
        const last = split[5];
        const generalPoints = first.map(s => /[\w\.]+: (\d+)/.exec(s)).map(match => parseInt(match[1]));
        const lastColumn = /[\w\.]+: (\d+)\w+: (\d+) - ([\w -]+).*/.exec(last);
        return {
            anime: generalPoints[0],
            manga: generalPoints[1],
            uploads: generalPoints[2],
            forum: generalPoints[3],
            wiki: generalPoints[4],
            additional: parseInt(lastColumn[1]),
            total: parseInt(lastColumn[2]),
            title: lastColumn[3]
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
        const status = row.find('td[align=center]');
        var text = "";
        if(status.find('#whatrustatus').length > 0) {
            text = status.find('#whatrustatus').text();
        } else {
            text = status.find('div').text();
        }

        const lastDashIndex = text.lastIndexOf(' - ');
        if(lastDashIndex < 0) {
            return null;
        }
        const message = text.substring(0, lastDashIndex);
        const time = text.substring(lastDashIndex + 1);
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
        const userinfo = parser.parseUserInfo($('.inner h3'));
        const self = parser.parseSelf($('#profileTop'));
        const info = parser.parseProfileTable($('.profile'));
        const image = parser.parseProfilePicture($('.inner table').first());
        info.name = userinfo.name;
        info.id = userinfo.id;
        info.picture = image;
        info.self = self;
        return info;
    });
};

export default parser;
