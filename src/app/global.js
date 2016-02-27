var winston = require('winston');
var path = require('path');

global.APP_NAME = "proxtop";
global.PROXER_BASE_URL = "https://proxer.me";
global.INDEX_LOCATION = __dirname + "../../index.html";
global.PROXER_PATHS = {
    ROOT: '/',
    LOGIN: '/component/user/?task=user.login',
    API_LOGIN: '/login?format=json&action=login',
    WATCHLIST: '/ucp?s=reminder',
    OWN_PROFILE: '/user',
    NEWS: '/news',
    NEWS_API: '/notifications?format=json&s=news&p=1',
    CONVERSATIONS_API: '/messages?format=json&json=conferences',
    MESSAGE_API: '/messages?format=json&json=messages&id=',
    MESSAGE_NEW_API: '/messages?format=json&json=newmessages&id=',
    MESSAGE_WRITE_API: '/messages?format=json&json=answer&id=',
    WATCH_ANIME: '/watch/%d/%d/%s',
    VIEW_MANGA: '/chapter/%d/%d/%s',
    LOGOUT: '/component/users/?task=user.logout',
    DELETE_WATCHLIST: '/ucp?format=json&type=deleteReminder&id='
};

global.ERRORS = require('./errors');

try {
    global.APP_DIR = path.join(require("app").getPath("appData"), APP_NAME);
} catch(e) {
    global.APP_DIR = path.join(__dirname, '..', '..', APP_NAME);
}

var logPath = path.join(APP_DIR, "app.log");
console.log("Setting logfile to " + logPath);
global.LOG = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'silly',
            timestamp: function() {
                return new Date();
            },
            formatter: function(options) {
                return '[' + options.level.toLowerCase() + '][' + options.timestamp() + '] ' +
                    (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' )
            }
        }),
        new (winston.transports.File)({
            filename: logPath
        })
    ]
});
