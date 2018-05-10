/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */

// Load dependencies
let $ = require('jquery');
window.$ = $;

let d3 = Object.assign({},
  require('d3-array'),
  require('d3-axis'),
  require('d3-fetch'),
  require('d3-geo'),
  require('d3-scale'),
  require('d3-selection'),
  require('d3-selection-multi'),
  require('d3-shape'),
  require('d3-svg'),
  require('d3-transition')
);
window.d3 = d3;

// Load variables
let Global = require('./modules/variables');
window.Global = Global;

// Load classes
let { Data } = require('./partials/data');
let { Map } = require('./partials/map');
let { Chart } = require('./partials/chart');



// Initialize Chart and Map
let chart = new Chart().init();
let map = new Map().geo(Global.GEO_FILE).chart(chart);

// Get data and update visualization
new Data(map, chart);
