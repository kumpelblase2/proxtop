const startup = require('./app/squirrel_startup.js');
if(startup()) {
    process.exit(0);
}

require('./app/global');
const { app } = require('electron');
LOG.verbose('Running on ' + process.versions['electron'] + ' on chrome ' + process.versions['chrome']);
LOG.verbose('Making sure app dir exists...');
require('./app/util/utils').createDirIfNotExists(APP_DIR);

const Proxtop = require('./app/proxtop');
const windowManager = require('./app/ui/window_manager');
const UpdaterProvider = require('./app/updater');
const tray = require('./app/ui/tray_manager');
const translate = require('./app/translation');

import translationDE from '../common/locale/locale-de';
import translationEN from '../common/locale/locale-en';

translate.setup({
    de: translationDE,
    en: translationEN
});

LOG.verbose('Initializing...');
const updater = UpdaterProvider();

windowManager.setDirs({
    app: APP_DIR,
    logo: LOGO_LOCATION,
    index: INDEX_LOCATION
});

tray.icon = LOGO_LOCATION;

const apiKey = process.env['PROXTOP_API_KEY'] || "api_key_here";
const proxtop = new Proxtop(app, updater, {
    app_dir: APP_DIR,
    api_key: apiKey
});

app.on('ready', function() {
    LOG.verbose('Starting up...');
    proxtop.start().then(function() {
        LOG.verbose('Off we go!');
    });
});

module.exports = proxtop;
