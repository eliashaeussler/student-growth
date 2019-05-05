/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const GoogleFontsPlugin = require('google-fonts-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

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
      fonts: [
        { family: "Inconsolata", variants: ["400"] },
        { family: "Open Sans", variants: ["400", "italic", "700"] }
      ],
      filename: "../css/fonts.css",
      path: "../fonts/"
    }),
    new UglifyJsPlugin()
  ]
};
