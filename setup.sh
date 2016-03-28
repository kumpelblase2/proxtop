#!/bin/sh
if ! type "npm" > /dev/null; then
    echo "NPM is not installed. Please make sure you have Node.js and npm on your system."
    exit 1
fi

if ! type "bower" > /dev/null; then
    echo "Bower is not installed. Please make sure you have bower on your system."
    exit 1
fi

npm install && bower install
