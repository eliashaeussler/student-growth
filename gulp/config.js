/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const yaml = require('js-yaml');
const fs = require('fs');
const config = yaml.safeLoad(fs.readFileSync(__dirname + '/../config.yml'), 'utf8');

module.exports = {
  PRODUCTION: process.env.NODE_ENV === 'prod',
  DOWNLOAD: process.argv.includes('--force-download'),
  ...config
};
