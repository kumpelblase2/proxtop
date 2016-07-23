var fs = require('fs');
var path = require('path');
var myPackage = require('../package.json');

var packagePath = path.join('.', 'build', 'package.json');
var buildPackage = fs.readFileSync(packagePath);
var json = JSON.parse(buildPackage);
json.dependencies = myPackage.dependencies;
json.version = myPackage.version;
fs.writeFileSync(packagePath, JSON.stringify(json, null, '  '));