var low = require('lowdb');
var path = require('path');
var storage = require('lowdb/lib/file-sync')

module.exports = new low(path.join(APP_DIR, 'cache.db'), {
    storage: storage
});
