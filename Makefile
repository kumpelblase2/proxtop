PATH	:= node_modules/.bin:$(PATH)

SOURCE_FILES = src package.json bower.json bower_components main.js
TARGET_DIR = _dist
BUILD_DIR = _packaged
DESTDIR = ${BUILD_DIR}/proxtop-linux-x64-deb
VERSION = $(shell cat package.json | grep "version" | cut -d '"' -f4)

ICON_DIR = usr/share/icons/hicolor/
ICON_48_DIR = ${ICON_DIR}/48x48/apps
ICON_256_DIR = ${ICON_DIR}/256x256/apps

DESKTOP_ENTRY_DIR = usr/share/applications/

setup:
	npm install
	bower install

.PHONY: setup

clean:
	if test -d $(TARGET_DIR); then rm -r $(TARGET_DIR); fi
	if test -d $(BUILD_DIR); then rm -r $(BUILD_DIR); fi

prepare:
	mkdir $(TARGET_DIR)
	cp -R $(SOURCE_FILES) $(TARGET_DIR)
	cd $(TARGET_DIR) && npm install --production
	mkdir $(BUILD_DIR)

build-windows: prepare
	electron-packager $(TARGET_DIR) --platform=win32 --arch=all --out=$(BUILD_DIR) --overwrite --asar --icon=build/proxtop_logo_256.ico

build-linux: prepare
	electron-packager $(TARGET_DIR) --platform=linux --arch=x64 --out=$(BUILD_DIR) --overwrite --asar --icon=build/proxtop_logo_256.png

build-osx: prepare
	electron-packager $(TARGET_DIR) --platform=darwin --arch=x64 --out=$(BUILD_DIR) --overwrite --asar --icon=build/proxtop_logo_256.icns

build: build-windows build-osx build-linux

package-linux: build
	cd $(BUILD_DIR) && tar -cvzf proxtop-$(VERSION)-linux.tar.gz proxtop-linux-x64

package-osx: build
	cd $(BUILD_DIR) && tar -cvzf proxtop-$(VERSION)-osx.tar.gz proxtop-darwin-x64

package-win: build
	cd $(BUILD_DIR) && zip -r proxtop-$(VERSION)-win.zip proxtop-win32-x64
	cd $(BUILD_DIR) && zip -r proxtop-$(VERSION)-win-32bit.zip proxtop-win32-ia32

package-deb: build
	cd $(BUILD_DIR)/proxtop-linux-x64 && mkdir -p opt/proxtop \
		&& (mv ./* opt/proxtop || true)

	cd $(BUILD_DIR)/proxtop-linux-x64 && mkdir -p usr/bin \
		&& mkdir -p ${ICON_48_DIR} && cp ../../build/proxtop_logo_48.png ${ICON_48_DIR}/proxtop.png \
		&& mkdir -p ${ICON_256_DIR} && cp ../../build/proxtop_logo_256.png ${ICON_256_DIR}/proxtop.png \
		&& mkdir -p ${DESKTOP_ENTRY_DIR} && cp ../../build/proxtop.desktop ${DESKTOP_ENTRY_DIR}/proxtop.desktop \
		&& cd usr/bin \
		&& ln -s ../../opt/proxtop/proxtop proxtop

	cd $(BUILD_DIR)/proxtop-linux-x64 && fpm -s dir -t deb -n proxtop -v $(VERSION) --deb-no-default-config-files . && mv proxtop_$(VERSION)_amd64.deb ..

package: package-linux package-osx package-win package-deb
