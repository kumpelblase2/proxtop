const OpenHandler = require('./open_handler');

function API(settings) {
    this.handers = [
        new OpenHandler(settings)
    ];
}

API.prototype.init = function() {
    this.handers.forEach(function(elem) { elem.register(); });
};

module.exports = API;
