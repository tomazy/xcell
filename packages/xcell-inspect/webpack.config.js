path = require('path')

const distDir = path.join(__dirname, 'dist')

const defaultConfig = (declaration) => ({
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },

  module: {
    rules: [{
      test: /\.worker\./,
      use: {
        loader: 'worker-loader',
        options: {
          inline: true,
          fallback: false
        }
      }
    }, {
      test: /\.ts$/,
      loader: 'ts-loader',
      options: {
        compilerOptions: {
          declaration,
          target: 'es5',
          outDir: '',
        }
      }
    }],
  },

  plugins: []
});

module.exports = [
  Object.assign(defaultConfig(false), {
    entry: './src/index-umd.ts',
    output: {
      library: 'xcellInspect',
      libraryTarget: 'umd',
      filename: 'xcell-inspect-umd.js',
      path: distDir,
    },
  }),

  Object.assign(defaultConfig(true), {
    entry: './src/index.ts',
    output: {
      filename: 'index.js',
      libraryTarget: 'commonjs2',
      path: distDir,
    },
  }),
]
