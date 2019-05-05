/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const browser = require('browser-sync');
const {PATHS, SERVER} = require('../config');

module.exports = cb => {
  browser.init({
    server: PATHS.dist,
    port: SERVER.port
  });
  if ("function" === typeof cb) cb();
};
