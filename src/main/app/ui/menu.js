import windowManager from "./window_manager";
import { Menu } from "electron";
import { isOnOSX } from '../util/is_osx';

export default function createMenu(proxtop) {
    return Menu.buildFromTemplate([
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
                    label: 'Toggle Developer Tools',
                    accelerator: useUnlessOnOsx('Ctrl+Shift+I', 'Alt+Command+I'),
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    }
                },
                {
                    label: 'Reload',
                    accelerator: useUnlessOnOsx('Ctrl+R', 'Command+R'),
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
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
};

function useUnlessOnOsx(normalShortcut, osxShortcut) {
    if(isOnOSX) {
        return osxShortcut;
    } else {
        return normalShortcut;
    }
}
