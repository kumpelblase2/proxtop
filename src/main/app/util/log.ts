import * as path from 'path';
import { APP_DIR } from "../globals";
import { Logger, transports } from "winston";
import * as moment from "moment";

const logPath = path.join(APP_DIR, "app.log");
console.log("Setting logfile to " + logPath);
export default new Logger({
    transports: [
        new transports.Console({
            level: 'silly',
            timestamp: function() {
                return new Date();
            },
            formatter: function(options) {
                const timestamp = moment(options.timestamp()).format("DD.MM.YYYY HH:mm:ss:SS");
                const message = (undefined !== options.message ? options.message : '');
                const meta = (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
                return '[' + options.level.toLowerCase() + '][' + timestamp + '] ' + message + meta
            }
        }),
        new transports.File({
            filename: logPath
        })
    ]
});
