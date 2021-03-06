import * as os from 'os';
import * as path from "path";
import * as child from "child_process";

function runSquirrel(args, callback: () => void) {
    const updateExec = path.resolve(path.dirname(process.execPath), "..", "update.exe");
    const proc = child.spawn(updateExec, args, { detached: true });
    proc.on('close', callback);
}

function install(callback: () => void) {
    const target = path.basename(process.execPath);
    runSquirrel(['--createShortcut', target], callback);
}

function uninstall(callback: () => void) {
    const target = path.basename(process.execPath);
    runSquirrel(['--removeShortcut', target], callback);
}

export default function startup() {
    if(os.platform() !== 'win32') {
        return false;
    }

    const { app } = require('electron');
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
            install(app.quit);
            return true;
        case '--squirrel-updated':
            install(app.quit);
            return true;
        case '--squirrel-obsolete':
            app.quit();
            return true;
        case '--squirrel-uninstall':
            uninstall(app.quit);
            return true;
        default:
            return false;
    }
}
