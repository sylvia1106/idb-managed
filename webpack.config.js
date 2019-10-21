var webpack = require('webpack');
var path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;

module.exports = [
    {
        mode: 'development',
        entry: {
            'idb-managed': ['./src/index.ts']
        },
        output: {
            path: path.join(__dirname, './dist'),
            filename: '[name].js',
            chunkFilename: '[name].[chunkhash].js',
            publicPath: './',
            library: 'IDBM',
            libraryTarget: 'umd',
            crossOriginLoading: 'anonymous'
        },
        devtool: 'source-map',
        resolve: {
            extensions: ['.ts', '.tsx']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader'
                        }
                    ]
                }
            ]
        },
        // plugins: [new BundleAnalyzerPlugin()]
    }
];
