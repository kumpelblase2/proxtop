var OpenHandler = require('./open_handler');
var NotifyHandler = require('./notify_handler');

function API(cookiePath) {
    this.handers = [
        new OpenHandler(),
        new NotifyHandler()
    ];
}

API.prototype.init = function() {
    this.handers.forEach(function(elem) { elem.register(); });
}

module.exports = API;
