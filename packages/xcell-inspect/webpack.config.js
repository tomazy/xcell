path = require('path')

const distDir = path.join(__dirname, 'dist')

const rules = [{
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
      declaration: true,
      target: 'es5',
      outDir: '',
    }
  }
}];

const defaultConfig = {
  entry: './src/index.ts',

  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },

  module: {
    rules,
  },

  plugins: []
};

module.exports = [
  Object.assign({}, defaultConfig, {
    output: {
      library: 'xcellInspect',
      libraryTarget: 'umd',
      filename: 'xcell-inspect-umd.js',
      path: distDir,
    },
  }),

  Object.assign({}, defaultConfig, {
    output: {
      filename: 'index.js',
      libraryTarget: 'commonjs2',
      path: distDir,
    },
  }),
]
