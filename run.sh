#!/bin/sh
./node_modules/.bin/webpack-cli --mode=development
ELECTRON_ENABLE_LOGGING=true ./node_modules/.bin/electron dist
