/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {src} = require('gulp');
const sassLint = require('gulp-sass-lint');
const {PATHS} = require('../config');

module.exports = () => src(PATHS.sass.src)
  .pipe(sassLint())
  .pipe(sassLint.format())
  .pipe(sassLint.failOnError());
