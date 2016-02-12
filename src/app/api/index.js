var OpenHandler = require('./open_handler');

function API(cookiePath) {
    this.handers = [
        new OpenHandler()
    ];
}

API.prototype.init = function() {
    this.handers.forEach(function(elem) { elem.register(); });
};

module.exports = API;
