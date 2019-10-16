import { createDirIfNotExists } from "./app/util/utils";
import { app } from "electron";
import translationDE from '../common/locale/locale-de.json';
import translationEN from '../common/locale/locale-en.json';
import startup from "./app/squirrel_startup";
import windowManager from "./app/ui/window_manager";
import tray from "./app/ui/tray_manager";
import Log from './app/util/log';
import getUpdaterForCurrentSystem from "./app/updater";
import { APP_DIR, INDEX_LOCATION, LOGO_LOCATION } from "./app/globals";
import Proxtop from "./app/proxtop";
import { setup as setupTranslation } from "./app/translation";

if(startup()) {
    process.exit(0);
}

Log.verbose(`Running on ${process.versions['electron']} on chrome ${process.versions['chrome']}`);
Log.verbose('Making sure app dir exists...');
createDirIfNotExists(APP_DIR);
setupTranslation({
    de: translationDE,
    en: translationEN
});

Log.verbose('Initializing...');
const updater = getUpdaterForCurrentSystem();

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

app.on('ready', () => {
    Log.verbose('Starting up...');
    proxtop.start().then(() => Log.verbose('Off we go!'));
});

export default proxtop;
