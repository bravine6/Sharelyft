const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    contact_us: './public_html/contact_us.js',
    login: './public_html/login.js',
    offer_ride: './public_html/offer_ride.js',
    profile: './public_html/profile.js',
    register: './public_html/register.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};