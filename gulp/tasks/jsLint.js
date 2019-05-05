/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {src} = require('gulp');
const jshint = require('gulp-jshint');
const {PATHS} = require('../config');

module.exports = () => src(PATHS.javascript.src)
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
