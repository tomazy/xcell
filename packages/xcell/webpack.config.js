module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'xcell.umd.js',
    path: __dirname + '/dist',
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
