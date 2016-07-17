const { app } = require('electron');

module.exports = {
    getHeaders: function(customDisabled, platform, release) {
        var header;
        if(customDisabled) {
            var osInfo;
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
            'User-Agent': header
        };
    },

    checkUnauthorized: function(page) {
        return /Du bist nicht eingeloggt/.test(page);
    }
};
