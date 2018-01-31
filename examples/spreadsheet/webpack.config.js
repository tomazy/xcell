const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  },

  devtool: 'source-maps',

  resolve: {
    extensions: ['.js', '.json']
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: [
              'babel-plugin-yo-yoify',
              'transform-object-rest-spread'
            ]
          }
        }
      }
    ]
  },

  devServer: {
    contentBase: './dist'
  },

  node: {
    fs: 'empty'
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'index.html')
    })
  ]
}
