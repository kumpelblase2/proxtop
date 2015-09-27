var SessionHandler = require('./session_handler');
var LoginHandler = require('./login_handler');
var ipc = require('ipc');

function API(cookiePath) {
    this.session_handler = new SessionHandler(cookiePath);
    this.login_handler = new LoginHandler(this.session_handler);
}

API.prototype.init = function() {
    this.login_handler.register();
    return this.session_handler.loadState();
}

module.exports = API;
