import low from "lowdb";
import path from "path";
import FileSync from "lowdb/adapters/FileSync";
import { APP_DIR } from "../globals";

const adapter = new FileSync(path.join(APP_DIR, 'cache.db'));
export default new low(adapter);
