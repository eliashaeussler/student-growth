/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const rimraf = require('rimraf');
const {PATHS} = require('../config');

module.exports = cb => rimraf(PATHS.dist, cb);
