import { app } from 'electron';

type Platform = "darwin" | "linux" | "win32";

type HeadersInformation = { [headerName: string]: string }

export function getHeaders(customDisabled: boolean, platform: Platform, release: string, apiKey: string): HeadersInformation {
    let header;
    if(customDisabled) {
        let osInfo;
        switch(platform) {
            case 'darwin':
                osInfo = 'Macintosh; Intel Mac OS X ';
                osInfo += release.replace('.', '_');
                break;
            case 'linux':
                osInfo = 'X11; Linux x86_64';
                break;
            case 'win32':
                osInfo = 'Windows NT 6.2; WOW64';
                break;
        }

        header = 'Mozilla/5.0 (' + osInfo + ') ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + process.versions['chrome'] + ' ' +
            'Safari/537.36';
    } else {
        header = 'Chrome/' + process.versions['chrome'] + ' Electron/' + process.versions['electron'] + ' Proxtop/' + app.getVersion()
    }

    return {
        'User-Agent': header,
        'proxer-api-key': apiKey
    };
}

export function checkUnauthorized(page) {
    return /Du bist nicht eingeloggt/.test(page);
}
