const path = require('path')

const distDir = path.join(__dirname, 'dist')

module.exports = {
  entry: './src/index-umd.ts',
  output: {
    library: 'xcell',
    libraryTarget: 'umd',
    filename: 'xcell-umd.js',
    path: distDir,
  },

  resolve: {
    extensions: ['.ts'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            declaration: false,
          }
        }
      }
    ]
  },

  plugins: []
}
