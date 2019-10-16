import windowManager from "./window_manager";
import { Menu } from "electron";
import { isOnOSX } from '../util/is_osx';
import Proxtop from "../proxtop";

export default function createMenu(proxtop: Proxtop) {
    const menu = Menu.buildFromTemplate([
        {
            label: 'Proxtop',
            submenu: [
                {
                    label: 'About',
                    role: 'about',
                    click: function() {
                        windowManager.createAboutWindow();
                    }
                },
                {
                    label: 'Open Developer Tools',
                    accelerator: useUnlessOnOsx('Ctrl+Shift+I', 'Alt+Command+I'),
                    click: function(item, focusedWindow) {
                        if(focusedWindow) {
                            focusedWindow.webContents.openDevTools();
                        }
                    }
                },
                {
                    label: 'Reload',
                    accelerator: useUnlessOnOsx('Ctrl+R', 'Command+R'),
                    click: function(item, focusedWindow) {
                        if(focusedWindow) {
                            focusedWindow.reload();
                        }
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: useUnlessOnOsx('Ctrl+Q', 'Command+Q'),
                    click: function() {
                        proxtop.shutdown();
                        proxtop.app.quit();
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);
};

function useUnlessOnOsx(normalShortcut, osxShortcut) {
    if(isOnOSX) {
        return osxShortcut;
    } else {
        return normalShortcut;
    }
}
