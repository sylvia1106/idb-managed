var path = require('path');
const STATIC_JS = 'js';
const PUBLIC_PATH = '/' + STATIC_JS + '/';
const DEMO_PATH = './demo';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
module.exports = [
    {
        mode: 'production',
        entry: {
            'idb-managed': ['./build/index.js']
        },
        output: {
            path: path.join(__dirname, DEMO_PATH, STATIC_JS),
            filename: '[name].js',
            library: 'IDBM',
            libraryTarget: 'umd'
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: []
        },
        // plugins: [new BundleAnalyzerPlugin()],
        devServer: {
            hot: true,
            contentBase: DEMO_PATH,
            publicPath: PUBLIC_PATH,
            open: true
        }
        // ,devtool: 'source-map'
    }
];
