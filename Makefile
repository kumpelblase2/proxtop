PATH	:= node_modules/.bin:$(PATH)

SOURCE_FILES = src package.json bower.json bower_components main.js
TARGET_DIR = _dist
BUILD_DIR = _packaged
VERSION = $(shell cat package.json | grep "version" | cut -d '"' -f4)

ICON_DIR = usr/share/pixmaps/

setup:
	npm install
	bower install

.PHONY: setup

clean:
	-rm -r $(TARGET_DIR)
	-rm -r $(BUILD_DIR)

prepare:
	mkdir $(TARGET_DIR)
	cp -R $(SOURCE_FILES) $(TARGET_DIR)
	cd $(TARGET_DIR) && npm install --production

build: prepare
	mkdir $(BUILD_DIR)
	electron-packager $(TARGET_DIR) --platform=all --arch=x64 --out=$(BUILD_DIR) --overwrite --asar --icon=build/proxtop_logo_256
	rm -r $(BUILD_DIR)/proxtop-mas-x64

package: build
	cd $(BUILD_DIR) && tar -cvzf proxtop-$(VERSION)-osx.tar.gz proxtop-darwin-x64
	cd $(BUILD_DIR) && tar -cvzf proxtop-$(VERSION)-linux.tar.gz proxtop-linux-x64
	cd $(BUILD_DIR) && zip -r proxtop-$(VERSION)-win.zip proxtop-win32-x64
	cd $(BUILD_DIR)/proxtop-linux-x64 && mkdir -p opt/proxtop \
		&& (mv ./* opt/proxtop || true)

	cd $(BUILD_DIR)/proxtop-linux-x64 && mkdir -p usr/bin \
		&& mkdir -p ${ICON_DIR} && cp ../../build/proxtop_logo_48.png ${ICON_DIR}/proxtop_48x48.png \
		&& mkdir -p ${ICON_DIR} && cp ../../build/proxtop_logo_256.png ${ICON_DIR}/proxtop_256x256.png \
		&& cd usr/bin \
		&& ln -s ../../opt/proxtop/proxtop proxtop

	cd $(BUILD_DIR)/proxtop-linux-x64 && fpm -s dir -t deb -n proxtop -v $(VERSION) --deb-no-default-config-files . && mv proxtop_$(VERSION)_amd64.deb ..
