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
      library: 'xcellGraph',
      libraryTarget: 'umd',
      filename: 'xcell-graph-umd.js',
      path: __dirname + '/dist',
    },
  }),

  Object.assign({}, defaultConfig, {
    output: {
      filename: 'index.js',
      libraryTarget: 'commonjs2',
      path: __dirname + '/dist',
    },
  }),
]
