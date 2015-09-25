var _ = require('lodash');

module.exports = {
    fillLogin: function(form, data) {
        var formData = _.merge(form, data);
        return formData;
    },

    headers: function() {
        return {
            'User-Agent': 'Chrome/' + process.versions['chrome'] + ' Electron/' + process.versions['electron']
        };
    }
};
