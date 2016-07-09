PATH	:= node_modules/.bin:$(PATH)

SOURCE_FILES = src build/package.json bower.json bower_components main.js
TARGET_DIR = _dist
BUILD_DIR = _packaged
PACKAGE_DIR = ${BUILD_DIR}/proxtop-linux-x64-pkg/
DATA_DIR = share/proxtop
DESTDIR = usr/
VERSION = $(shell cat package.json | grep "version" | cut -d '"' -f4)

ICON_DIR = share/icons/hicolor
ICON_48_DIR = ${ICON_DIR}/48x48/apps
ICON_256_DIR = ${ICON_DIR}/256x256/apps
ICON_512_DIR = ${ICON_DIR}/512x512/apps
ICON_256_DIR = ${ICON_DIR}/128x128/apps

PACKAGER_ARGS = --overwrite --asar
BUILD_COMMAND = ./node_modules/.bin/build

DESKTOP_ENTRY_DIR = share/applications

setup:
	npm install
	bower install

.PHONY: setup

clean:
	if test -d $(TARGET_DIR); then rm -r $(TARGET_DIR); fi
	if test -d $(BUILD_DIR); then rm -r $(BUILD_DIR); fi

prepare:
	mkdir -p $(TARGET_DIR)
	cp -R $(SOURCE_FILES) $(TARGET_DIR)
	mkdir -p $(BUILD_DIR)

build-windows: prepare
	$(BUILD_COMMAND) -w

build-linux: prepare
	$(BUILD_COMMAND) -l

build-osx: prepare
	electron-packager $(TARGET_DIR) --platform=darwin --arch=x64 --out=$(BUILD_DIR) --icon=build/icon.icns $(PACKAGER_ARGS)

build-dmg: prepare
	$(BUILD_COMMAND) -m

build: build-windows build-osx build-linux

package-linux: build-linux

package-osx: build-osx
	cd $(BUILD_DIR) && tar -cvzf proxtop-$(VERSION)-osx.tar.gz Proxtop-darwin-x64

package-dmg: build-dmg

package-win: build-windows

package: package-linux package-osx package-win

package-full: package package-dmg
