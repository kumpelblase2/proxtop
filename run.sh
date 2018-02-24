#!/bin/sh
./node_modules/.bin/webpack
ELECTRON_ENABLE_LOGGING=true ./node_modules/.bin/electron dist
