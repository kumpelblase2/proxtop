module.exports = {
    headers: {
        'User-Agent': 'Chrome/' + process.versions['chrome'] + ' Electron/' + process.versions['electron']
    },

    checkUnauthorized: function(page) {
        return /Du bist nicht eingeloggt/.test(page);
    }
};
