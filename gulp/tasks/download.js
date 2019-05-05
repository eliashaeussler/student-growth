/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {spawn} = require('child_process');
const {DOWNLOAD} = require('../config');

module.exports = cb => {
  if (DOWNLOAD) {
    const pythonProcess = spawn('python3', [__dirname + '/../../bin/download.py']);
    pythonProcess.stdout.on('data', data => console.log(String(data)));
  }
  if ("function" === typeof cb) cb();
};
