var winston = require("winston");

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'silly',
            timestamp: function() {
                return new Date();
            },
            formatter: function(options) {
                return '[' + options.level.toLowerCase() + '][' + options.timestamp() + '] ' +
                    (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' )
            }
        })
    ]
});

module.exports = logger;
