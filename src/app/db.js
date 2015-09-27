var low = require('lowdb');
var path = require('path');

module.exports = new low(path.join(APP_DIR, 'cache.db'));
