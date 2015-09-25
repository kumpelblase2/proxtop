var SessionHandler = require('./session_handler');
var ipc = require('ipc');

function API(app) {
    this.session_handler = new SessionHandler(app);
}

API.prototype.init = function() {
    var self = this;
    ipc.on('login', function(event, user, keepLogin) {
        self.session_handler.login(user.username, user.password, keepLogin).then(function(result) {
            event.sender.send('login', result);
        });
    });

    return this.session_handler.loadState();
}

module.exports = API;
