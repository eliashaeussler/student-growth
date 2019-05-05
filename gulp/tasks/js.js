/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {dest, src} = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const when = require('gulp-if');
const named = require('vinyl-named');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const {PATHS, PRODUCTION} = require('../config');

module.exports = () => src(PATHS.javascript.entry, { nodir: true })
  .pipe(named())
  .pipe(sourcemaps.init())
  .pipe(webpackStream(require('../../webpack.config'), webpack))
  .pipe(when(!PRODUCTION, sourcemaps.write()))
  .pipe(dest(PATHS.dist + '/assets/js'));
