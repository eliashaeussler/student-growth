/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {series, watch} = require('gulp');
const {PATHS} = require('../config');

module.exports = cb => {
  watch(PATHS.data, series('copy', 'reload'));
  watch(PATHS.javascript.src, series('js:lint', 'js', 'reload'));
  watch(PATHS.sass.src, series('sass:lint', 'sass', 'reload'));
  watch(PATHS.pages, series('pages', 'reload'));
  if ("function" === typeof cb) cb();
};
