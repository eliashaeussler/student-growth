/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {dest, src} = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const named = require('vinyl-named');
const when = require('gulp-if');
const {COMPATIBILITY, PATHS, PRODUCTION} = require('../config');

module.exports = () => src(PATHS.sass.entry)
  .pipe(named())
  .pipe(sourcemaps.init())
  .pipe(sass({
    includePaths: [PATHS.sass.entry].concat(PATHS.sass.modules)
  }).on('error', sass.logError))
  .pipe(autoprefixer({browsers: COMPATIBILITY}))
  .pipe(when(PRODUCTION, cleanCss({
    compatibility: 'ie8',
    level: {
      1: {
        specialComments: 1
      }
    }
  })))
  .pipe(when(!PRODUCTION, sourcemaps.write()))
  .pipe(dest(PATHS.dist + '/assets/css'));
