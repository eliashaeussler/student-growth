/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */


/**
 * Data information file
 * @type {string}
 */
const INFO_FILE = "data/info.json";

/**
 * Reference to GeoJSON data source file
 * @type {string}
 */
const GEO_FILE = "data/de-states.json";

/**
 * CSS selector for fullscreen element
 * @type {string}
 */
const FULLSCREEN_SELECTOR = ".fullscreen";

/**
 * CSS selector for data info element
 * @type {string}
 */
const DATA_INFO_SELECTOR = ".page-header__meta";

/**
 * CSS selector for visualization controls element
 * @type {string}
 */
const CONTROLS_SELECTOR = ".visualization__controls";

/**
 * CSS selector for visualization map element
 * @type {string}
 */
const MAP_SELECTOR = ".visualization__map";

/**
 * CSS selector for visualization chart element
 * @type {string}
 */
const CHART_SELECTOR = ".visualization__chart";

/**
 * Geometrical center of Germany
 * @type {number[]}
 */
const GEO_CENTER = [10.45, 51.16];

/**
 * Scaling for Geo Map
 * @type {number}
 */
const GEO_SCALE = 2800;

/**
 * Key of state name inside GeoJSON file
 * @type {string}
 */
const GEO_KEY_NAME = "NAME_1";

/**
 * Default fallback color for states
 * @type {string}
 */
const STATE_DEFAULT_COLOR = "#aaa";

module.exports = {
  INFO_FILE,
  GEO_FILE,
  FULLSCREEN_SELECTOR,
  DATA_INFO_SELECTOR,
  CONTROLS_SELECTOR,
  MAP_SELECTOR,
  CHART_SELECTOR,
  GEO_CENTER,
  GEO_SCALE,
  GEO_KEY_NAME,
  STATE_DEFAULT_COLOR
};
