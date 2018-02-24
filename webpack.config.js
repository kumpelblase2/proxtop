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
                    test: /\.html$/,
                    use: 'html-loader'
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: "file-loader"
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
