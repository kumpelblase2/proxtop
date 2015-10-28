var notifier = require('node-notifier');
var ipc = require('ipc');
var util = require('util');

function NotifyHandler() {

}

NotifyHandler.prototype.register = function() {
    var self = this;
    ipc.on('notify', function(event, data) {
        notifier.notify(data);
    });
};

module.exports = NotifyHandler;
