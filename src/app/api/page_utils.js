var _ = require('lodash');

module.exports = {
    isLoggedIn: function($) {
        return $('#uname').length != 0;
    },

    fillLogin: function($, data) {
        var form = $('#login-form');
        var formData = _.merge(_.reduce(form.serializeArray(), function(result, info) {
            result[info.name] = info.value;
            return result;
        }, {}), data);
        return formData;
    },

    headers: function() {
        return {
            'User-Agent': 'Chrome/' + process.versions['chrome'] + ' Electron/' + process.versions['electron']
        };
    }
};
