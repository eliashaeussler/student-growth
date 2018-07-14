/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */

'use strict';

import plugins from 'gulp-load-plugins';
import yargs from 'yargs';
import gulp from 'gulp';
import browser from 'browser-sync';
import rimraf from 'rimraf';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import named from 'vinyl-named';




// ==================== CONSTANTS ====================

// Define Server Settings
const SERVER = {
  port: "8000"
};

// Define Paths
const PATHS = {
  dist: "dist",
  data: "src/data/**/*",
  images: [
    "src/assets/img/**/*"
  ],
  javascript: {
    all: "src/assets/js/**/*.js",
    entry: "src/assets/js/main.js",
  },
  sass: {
    all: "src/assets/scss/**/*.scss",
    entry: "src/assets/scss/main.scss",
    modules: [
      "node_modules/reset-css",
      "node_modules/spinkit/scss"
    ]
  },
  pages: "src/**/*.html"
};

// Browser compatibility
const COMPATIBILITY = [
  "last 2 versions",
  "ie >= 8",
  "ios >= 7"
];

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);




// ==================== TASKS ====================

// Load all Gulp plugins
const $ = plugins();

/**
 * Compile Sass
 * @returns {*}
 */
let sass = () =>
{
  return gulp.src(PATHS.sass.entry)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: [PATHS.sass.entry].concat(PATHS.sass.modules)
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({ browsers: COMPATIBILITY }))
    .pipe($.if(PRODUCTION, $.cleanCss({
      compatibility: 'ie8',
      level: {
        1: {
          specialComments: 1
        }
      }
    })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'));
};

/**
 * JavaScript Lint task
 * @returns {*}
 */
let lint = () =>
{
  return gulp.src(PATHS.javascript.all)
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
};

/**
 * Concatenate and minify JavaScript
 * @returns {*}
 */
let javascript = () =>
{
  return gulp.src(PATHS.javascript.entry)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream(require('./webpack.config'), webpack))
    .pipe($.if(PRODUCTION, $.uglify().on('error', e => { console.log(e); })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
};

/**
 * Copy pages to dist folder
 * @returns {*}
 */
let pages = () =>
{
  return gulp.src(PATHS.pages)
    .pipe(gulp.dest(PATHS.dist));
};

/**
 * Copy assets to dist folder
 * @returns {*}
 */
let copy = () =>
{
  return gulp.src(PATHS.data, { nodir: true })
    .pipe(gulp.dest(PATHS.dist + '/data'));
};

/**
 * Clean the dist folder
 * @param done
 */
let clean = done =>
{
  rimraf(PATHS.dist, done);
};

/**
 * Start a Server with BrowserSync
 * @param done
 */
let server = done =>
{
  browser.init({
    server: PATHS.dist, port: SERVER.port
  });
  done();
};

/**
 * Reload Browser
 * @param done
 */
let reload = done =>
{
  browser.reload();
  done();
};

/**
 * Watch Files for Changes
 */
let watch = () =>
{
  gulp.watch(PATHS.data, gulp.series(copy, reload));
  gulp.watch(PATHS.javascript.all, gulp.series(lint, javascript, reload));
  gulp.watch(PATHS.sass.all, gulp.series(sass, reload));
  gulp.watch(PATHS.pages, gulp.series(pages, reload));
};

/**
 * Build the dist folder
 */
let build = gulp.series(clean, gulp.parallel(copy, lint, sass, javascript, pages));

// Default Task
gulp.task('default', !PRODUCTION
  ? gulp.series(build, server, watch)
  : gulp.series(build, server)
);
