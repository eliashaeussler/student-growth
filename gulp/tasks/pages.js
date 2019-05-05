/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {dest, src} = require('gulp');
const {PATHS} = require('../config');

module.exports = () => src(PATHS.pages).pipe(dest(PATHS.dist));
