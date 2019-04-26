const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const DistPath = './dist'

var config = {
  entry: {
    'idb-managed': ['./src/index.es6']
  },
  mode: 'development',
  output: {
    path: path.join(__dirname, DistPath),
    filename: '[name].js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: './',
    library: 'IDBManaged',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.(es6|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: ['.js', '.es6', '.json']
  }
}

module.exports = config
