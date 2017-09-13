const os = require('os');
const path = require('path');
const child = require('child_process');

function runSquirrel(args, callback) {
    const updateExec = path.resolve(path.dirname(process.execPath), "..", "update.exe");
    const proc = child.spawn(updateExec, args, { detached: true });
    proc.on('close', callback);
}

function install(callback) {
    const target = path.basename(process.execPath);
    runSquirrel(['--createShortcut', target], callback);
}

function uninstall(callback) {
    const target = path.basename(process.execPath);
    runSquirrel(['--removeShortcut', target], callback);
}

function startup() {
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

module.exports = startup;
