import low from "lowdb";
import path from "path";
import storage from "lowdb/lib/storages/file-sync";
import { APP_DIR } from "../globals";

export default new low(path.join(APP_DIR, 'cache.db'), {
    storage: storage
});
