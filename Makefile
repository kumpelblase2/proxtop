PATH	:= node_modules/.bin:$(PATH)

GENERATE_DIR = dist
SOURCE_FILES = build/package.json static ${GENERATE_DIR}/*
TARGET_DIR = _dist
BUILD_DIR = _packaged
PACKAGE_DIR = ${BUILD_DIR}/proxtop-linux-x64-pkg/
DATA_DIR = share/proxtop/
DESTDIR = usr/
VERSION = $(shell cat package.json | grep "version" | cut -d '"' -f4)

ICON_DIR = share/icons/hicolor
ICON_48_DIR = ${ICON_DIR}/48x48/apps
ICON_256_DIR = ${ICON_DIR}/256x256/apps
ICON_512_DIR = ${ICON_DIR}/512x512/apps
ICON_256_DIR = ${ICON_DIR}/128x128/apps

PACKAGER_ARGS = --overwrite --asar
BUILD_COMMAND = electron-packager $(TARGET_DIR) --out=$(BUILD_DIR) $(PACKAGER_ARGS)
PACKAGE_COMMAND = ./node_modules/.bin/build
WEBPACK_COMMAND = ./node_modules/.bin/webpack-cli

DESKTOP_ENTRY_DIR = share/applications

default: setup update-build-package

setup:
	npm install

clean:
	if test -d $(TARGET_DIR); then rm -r $(TARGET_DIR); fi
	if test -d $(BUILD_DIR); then rm -r $(BUILD_DIR); fi
	if test -d $(GENERATE_DIR); then rm -r $(GENERATE_DIR); fi

install:
	mkdir -p $(DESTDIR)
	cp -r $(PACKAGE_DIR)/* $(DESTDIR)

update-build-package:
	node build/update_dependencies.js

prepare: update-build-package
	mkdir -p $(TARGET_DIR)
	./node_modules/.bin/webpack-cli --mode=production
	cp -R $(SOURCE_FILES) $(TARGET_DIR)
	mkdir -p $(BUILD_DIR)
	@sed -i -e "s/api_key_here/$(PROXTOP_API_KEY)/" $(TARGET_DIR)/index.js




build-windows: prepare

build-linux: prepare
	$(BUILD_COMMAND) --platform=linux --arch=x64 --icon=build/proxtop_logo_256.png

build-osx: prepare

build: build-windows build-osx build-linux




package-linux: build-linux
	cd $(BUILD_DIR) && tar -czf proxtop-$(VERSION)-linux.tar.gz Proxtop-linux-x64

package-osx: build-osx
	$(PACKAGE_COMMAND) -m -p never

package-win: build-windows
	$(PACKAGE_COMMAND) -w -p never
	$(PACKAGE_COMMAND) -w --ia32 -p never

prepare-linux-package: build-linux
	mkdir -p $(PACKAGE_DIR)
	cd $(PACKAGE_DIR) && mkdir -p $(DATA_DIR) \
		&& cp -r ../Proxtop-linux-x64/* $(DATA_DIR)

	cd $(PACKAGE_DIR) \
		&& mkdir -p ${ICON_48_DIR} && cp ../../build/icons/48x48.png ${ICON_48_DIR}/proxtop.png \
		&& mkdir -p ${ICON_256_DIR} && cp ../../build/icons/256x256.png ${ICON_256_DIR}/proxtop.png \
		&& mkdir -p ${DESKTOP_ENTRY_DIR} && cp ../../build/proxtop.desktop ${DESKTOP_ENTRY_DIR}/proxtop.desktop \
		&& mkdir -p bin && cd bin \
		&& ln -s ../$(DATA_DIR)/proxtop proxtop

package-deb: prepare-linux-package
	cd $(PACKAGE_DIR) && fpm -s dir -t deb -n proxtop -v $(VERSION) --prefix "$(DESTDIR)" --deb-no-default-config-files . && mv proxtop_$(VERSION)_amd64.deb ../proxtop-$(VERSION)-amd64.deb

package: package-linux package-deb package-win

package-full: package package-osx
