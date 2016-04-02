require('./src/app/global');
const { app } = require('electron');
LOG.verbose('Running on ' + process.versions['electron'] + ' on chrome ' + process.versions['chrome']);
LOG.verbose('Making sure app dir exists...');
require('./src/app/utils').createDirIfNotExists(APP_DIR);

const Proxtop = require('./src/app/proxtop');
const WindowManager = require('./src/app/window_manager');
const Updater = require('./src/app/updater');
const TrayManager = require('./src/app/tray_manager');
const translate = require('./src/app/translation');
const settings = require('./src/app/settings');
const path = require('path');

translate.setup(settings, {
    path: path.join(__dirname, 'src', 'locale'),
    prefix: 'locale-',
    suffix: '.json'
});

LOG.verbose('Initializing...');
const updater = new Updater(GITHUB_RELEASES_URL);
const windowManager = new WindowManager({
    app: APP_DIR,
    logo: LOGO_LOCATION,
    index: INDEX_LOCATION
});

const trayManager = new TrayManager(LOGO_LOCATION);

const proxtop = new Proxtop(app, windowManager, updater, trayManager, {
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
