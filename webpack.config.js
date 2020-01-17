const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: { parser: './src/parser.ts' },
  output: {
    filename: '[name].js',
  },
  target: 'node',
  devtool: 'source-map',
  mode: 'production',
  optimization: {
    minimize: true,
  },
  performance: {
    hints: false,
  },
  resolve: {
    mainFields: ['main', 'module'],
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
}
