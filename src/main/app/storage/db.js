const low = require('lowdb');
const path = require('path');
const storage = require('lowdb/lib/storages/file-sync');

module.exports = new low(path.join(APP_DIR, 'cache.db'), {
    storage: storage
});
