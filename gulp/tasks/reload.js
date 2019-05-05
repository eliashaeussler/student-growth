/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const browser = require('browser-sync');

module.exports = cb => {
  browser.reload();
  if ("function" === typeof cb) cb();
};
