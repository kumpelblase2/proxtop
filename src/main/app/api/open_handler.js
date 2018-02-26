import IPCHandler from "../lib/ipc_handler";
import settings from "../settings";
import util from "util";
import childProcess from "child_process";
import Log from "../util/log";
import { PROXER_BASE_URL } from "../globals";

const opener = require('opn');

export default class OpenHandler extends IPCHandler {
    constructor() {
        super();
    }

    buildUrl(type, id, ep, sub) {
        const path = type === 'anime' ? PROXER_PATHS.WATCH_ANIME : PROXER_PATHS.VIEW_MANGA;
        sub = type === 'anime' ? sub : (sub === 'englisch' ? 'en' : 'de');
        return PROXER_BASE_URL + util.format(path, id, ep, sub);
    }

    open(type, id, ep, sub) {
        let openSettings;
        if(type === 'anime') {
            openSettings = settings.getAnimeSettings();
        } else {
            openSettings = settings.getMangaSettings();
        }

        const url = this.buildUrl(type, id, ep, sub);
        if(openSettings.open_with === 'external') {
            this.openExternal(type, url);
        } else if(openSettings.open_with === 'system') {
            opener(url);
        }
    }

    openExternal(type, url) {
        let openSettings;
        if(type === 'anime') {
            openSettings = settings.getAnimeSettings();
        } else {
            openSettings = settings.getMangaSettings();
        }

        Log.info("Starting external application with url " + url);
        childProcess.spawn(openSettings.external_path, [url], {
            stdio: ['ignore', 'ignore', process.stderr]
        });
    }

    register() {
        this.provide('open', (event, ...args) => {
            this.open(...args);
        });
        this.provide('open-external', (event, url) => {
            this.openExternal('anime', url);
        });
        this.provide('open-link', (event, element) => {
            opener(element);
        });
    }
}
