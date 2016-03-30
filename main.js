require('./src/app/global');
const app = require('electron').app;
LOG.verbose('Running on ' + process.versions['electron'] + ' on chrome ' + process.versions['chrome']);
LOG.verbose('Making sure app dir exists...');
require('./src/app/utils').createDirIfNotExists(APP_DIR);

const Proxtop = require('./src/app/proxtop');
const WindowManager = require('./src/app/window_manager');
const Updater = require('./src/app/updater');

LOG.verbose('Initializing...');
const updater = new Updater(GITHUB_RELEASES_URL);
const windowManager = new WindowManager({
    app: APP_DIR,
    logo: LOGO_LOCATION,
    index: INDEX_LOCATION
});

const proxtop = new Proxtop(app, windowManager, updater, {
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
