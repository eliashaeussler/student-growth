/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const GoogleFontsPlugin = require('google-fonts-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const {FONTS} = require('./gulp/config');

module.exports = {
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
  },
  plugins: [
    new GoogleFontsPlugin({
      fonts: FONTS,
      filename: "../css/fonts.css",
      path: "../fonts/"
    }),
    new UglifyJsPlugin()
  ]
};
