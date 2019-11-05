var path = require('path');
const STATIC_JS = 'js'
const PUBLIC_PATH = '/' + STATIC_JS + '/'
const DEMO_PATH = './demo'
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;

module.exports = [
    {
        mode: 'development',
        entry: {
            'idb-managed': ['./src/index.ts']
        },
        output: {
            path: path.join(__dirname, DEMO_PATH, STATIC_JS),
            publicPath: PUBLIC_PATH,
            filename: '[name].js',
            library: 'IDBM',
            libraryTarget: 'umd'
        },
        resolve: {
            extensions: ['.ts', '.js']
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
                },
                {
                    test: /\.js$/,
                    include: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader'
                        }
                    ]
                },

            ]
        },
        // plugins: [new BundleAnalyzerPlugin()],
        devServer: {
            hot: true,
            contentBase: DEMO_PATH,
            publicPath: PUBLIC_PATH,
            open: true
        },
        // resolve: {
        //     alias: {
        //         idb: require.resolve('idb'),
        //     }
        // }
    }
];
