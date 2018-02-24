const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
    main_relative: 'main',
    renderer_relative: 'renderer',
    main: path.join(__dirname, 'src', 'main'),
    renderer: path.join(__dirname, 'src', 'renderer'),
    output: path.join(__dirname, 'dist'),
};

module.exports = [
    {
        entry: PATHS.main,
        target: "electron-main",
        node: {
            __dirname: false,
            __filename: false
        },
        output: {
            path: PATHS.output,
            filename: "index.js"
        }
    },
    {
        entry: PATHS.renderer,
        target: "electron-renderer",
        output: {
            path: PATHS.output,
            filename: "index-renderer.js"
        },
        node: {
            __dirname: false,
            __filename: false
        },
        module: {
            rules: [
                {
                    test: /\.(html)$/,
                    use: 'html-loader'
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/renderer/index.html'
            })
        ]
    }
];
