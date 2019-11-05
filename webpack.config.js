var path = require('path');
const STATIC_JS = 'js';
const PUBLIC_PATH = '/' + STATIC_JS + '/';
const DEMO_PATH = './demo';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const babelOptions = {
    presets: [['@babel/preset-env', { modules: 'commonjs' }]],
    plugins: [['@babel/plugin-transform-runtime', { corejs: 3 }]]
};
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
        // devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions
                        },
                        {
                            loader: 'ts-loader',
                            options: {
                                configFile: 'tsconfig.webpack.json'
                            }
                        }
                    ]
                },
                {
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions
                        }
                    ]
                }
            ]
        },
        // plugins: [new BundleAnalyzerPlugin()],
        devServer: {
            hot: true,
            contentBase: DEMO_PATH,
            publicPath: PUBLIC_PATH,
            open: true
        }
        // resolve: {
        //     alias: {
        //         idb: require.resolve('idb'),
        //     }
        // }
    }
];
