const path = require('path');

module.exports = {
  entry: './src/game.js',
  output: {
    filename: 'main.js',
    publicPath: './dist/',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(mp3|wav|png|jpg|ttf)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ],
      }
    ],
  }

};