require('./src/app/global');
var app = require('app');
LOG.verbose('Running on ' + process.versions['electron'] + ' on chrome ' + process.versions['chrome']);
LOG.verbose('Making sure app dir exists...');
require('./src/app/utils').createDirIfNotExists(APP_DIR);

var Proxtop = require('./src/app/proxtop');
var WindowManager = require('./src/app/window_manager');
var Updater = require('./src/app/updater');

LOG.verbose('Initializing...');
var updater = new Updater(GITHUB_RELEASES_URL);
var windowManager = new WindowManager({
    app: APP_DIR,
    logo: 'src/assets/proxtop_logo_256.png',
    index: INDEX_LOCATION
});

var proxtop = new Proxtop(app, windowManager, updater, {
    name: APP_NAME,
    app_dir: APP_DIR,
    proxer_url: PROXER_BASE_URL,
    info: require('./package.json')
});

app.on('ready', function() {
    LOG.verbose('Starting up...');
    proxtop.start().then(function() {
        LOG.verbose('Off we go!');
    });
});
module.exports = proxtop;
