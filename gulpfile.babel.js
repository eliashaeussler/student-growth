/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

const {parallel, series, task} = require('gulp');
const glob = require('glob-fs')();
const path = require('path');
const {PRODUCTION} = require('./gulp/config');

// Register tasks from files
glob.readdirSync('./gulp/tasks/*.js').forEach(file => {
  let name = path.basename(file, '.js').split(/(?=[A-Z])/).map(s => s.toLowerCase()).join(':');
  task(name, require('./' + file));
});

// Register global tasks
task('build', series('clean', 'download', parallel('copy', 'sass', 'js', 'pages')));
task('lint', series('sass:lint', 'js:lint'));
task('serve', series('server', 'watch'));
task('default', series(...(PRODUCTION ? ['build'] : ['lint', 'build', 'serve'])));
