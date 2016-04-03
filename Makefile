PATH	:= node_modules/.bin:$(PATH)

source_files = src package.json bower.json bower_components main.js
target_dir = _dist
build_dir = _packaged
version = $(shell cat package.json | grep "version" | cut -d '"' -f4)

setup:
	npm install
	bower install

.PHONY: setup

clean:
	-rm -r $(target_dir)
	-rm -r $(build_dir)

prepare:
	mkdir $(target_dir)
	cp -R $(source_files) $(target_dir)
	cd $(target_dir) && npm install --production

build: prepare
	mkdir $(build_dir)
	electron-packager $(target_dir) --platform=all --arch=x64 --out=$(build_dir) --overwrite --asar --icon=src/assets/proxtop_logo_256
	rm -r $(build_dir)/proxtop-mas-x64

package: build
	cd $(build_dir) && tar -cvzf proxtop-$(version)-osx.tar.gz proxtop-darwin-x64
	cd $(build_dir) && tar -cvzf proxtop-$(version)-linux.tar.gz proxtop-linux-x64
	cd $(build_dir) && zip -r proxtop-$(version)-win.zip proxtop-win32-x64
	cd $(build_dir)/proxtop-linux-x64 && mkdir -p opt/proxtop \
		&& (mv ./* opt/proxtop || true)

	cd $(build_dir)/proxtop-linux-x64 && mkdir -p usr/bin \
		&& cd usr/bin \
		&& ln -s ../../opt/proxtop/proxtop proxtop

	cd $(build_dir)/proxtop-linux-x64 && fpm -s dir -t deb -n proxtop -v $(version) --deb-no-default-config-files . && mv proxtop_$(version)_amd64.deb ..
