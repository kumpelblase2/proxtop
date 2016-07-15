mkdir _dist
mkdir _build
for %%f in (build\package.json main.js) do xcopy %%f _dist /f
xcopy "src\*.*" "_dist\src\" /s /e /h /f
xcopy "bower_components\*.*" "_dist\bower_components\" /s /e /h /f
.\node_modules\.bin\build -w