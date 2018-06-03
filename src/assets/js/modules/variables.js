/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */


module.exports = {

  /**
   * Data information file
   * @type {string}
   */
  INFO_FILE: "data/info.json",

  /**
   * Reference to GeoJSON data source file
   * @type {string}
   */
  GEO_FILE: "data/de-states.json",

  /**
   * CSS selector for fullscreen element
   * @type {string}
   */
  FULLSCREEN_SELECTOR: ".fullscreen",

  /**
   * CSS selector for data info element
   * @type {string}
   */
  DATA_INFO_SELECTOR: ".page-header__meta",

  /**
   * CSS selector for visualization controls element
   * @type {string}
   */
  CONTROLS_SELECTOR: ".visualization__controls",

  /**
   * CSS selector for visualization map element
   * @type {string}
   */
  MAP_SELECTOR: ".visualization__map",

  /**
   * CSS selector for visualization chart element
   * @type {string}
   */
  CHART_SELECTOR: ".visualization__chart",

  /**
   * Geometrical center of Germany
   * @type {number[]}
   */
  GEO_CENTER: [10.45, 51.16],

  /**
   * Scaling for Geo Map
   * @type {number}
   */
  GEO_SCALE: 2800,

  /**
   * Key of state name inside GeoJSON file
   * @type {string}
   */
  GEO_KEY_NAME: "NAME_1",

  /**
   * Default fallback color for states
   * @type {string}
   */
  STATE_DEFAULT_COLOR: "#aaa"

};
