/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */

const GoogleFontsPlugin = require('google-fonts-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
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
    })
  ]
};
