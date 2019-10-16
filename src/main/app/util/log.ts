import * as path from 'path';
import { APP_DIR } from "../globals";
import { createLogger, format, transports } from "winston";

const logPath = path.join(APP_DIR, "app.log");
console.log("Setting logfile to " + logPath);

export default createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SS' }),
        format.metadata({ fillExcept: ['message', 'timestamp', 'level'] }),
        format.printf(info => {
            const meta = (info.metadata && Object.keys(info.metadata).length ? '\n\t' + JSON.stringify(info.metadata) : '');
            return `[${info.level.toLowerCase()}][${info.timestamp}]: ${info.message}${meta}`;
        })
    ),
    transports: [
        new transports.Console({ level: 'silly' }),
        new transports.File({ filename: logPath })
    ]
});
