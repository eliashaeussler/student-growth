/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */

/**
 * Map visualizing the number of students in German states for a specific semester.
 *
 * Visualizes the number of students in Germany, separated in states, for a given semester. For this, a map of Germany
 * is being used. The visualization is based on data which is provided by the Federal Statistical Office of Germany. It
 * makes use of the D3 framework to build a SVG graphic which contains all 16 states of Germany, colored with the
 * amount of students for the given semester.
 */
export class VisualizationMap
{
  /**
   * Initialize map visualization.
   *
   * Defines some general settings regarding the map visualization.
   */
  constructor()
  {
    /**
     * Map object
     * @type {Object}
     * @private
     */
    this._map = {};

    /**
     * Reference to chart
     * @type {Chart}
     * @private
     */
    this._chart = null;

    /**
     * Width of svg element
     * @type {number}
     * @private
     */
    this._width = 600;

    /**
     * Height of svg element
     * @type {number}
     * @private
     */
    this._height = 700;

    /**
     * CSV data from source
     * @type {Array}
     * @private
     */
    this._data = [];

    /**
     * GeoJSON data from source
     * @type {Array}
     * @private
     */
    this._geo = [];

    /**
     * Colors for states
     * @type {scale}
     * @private
     */
    this._colors = d3.scaleQuantize()
      .range([
        "#ffecb3", "#ffe082", "#ffd54f",
        "#ffca28", "#ffc107", "#ffb300",
        "#ffa000", "#ff8f00", "#ff6f00"
      ]);

    /**
     * Currently selected x key
     * @type {string}
     * @private
     */
    this._key_x = "";

    /**
     * Currently selected y key
     * @type {string}
     * @private
     */
    this._key_y = "";

    /**
     * Total number of data with currently selected keys
     * @type {number}
     * @private
     */
    this._total_count = -1;

    /**
     * Reference to svg element
     * @type {Selection}
     * @private
     */
    this._svg = null;

    /**
     * Projection of data set
     * @type {scale}
     * @private
     */
    this._proj = null;

    /**
     * Map paths
     * @type {path}
     * @private
     */
    this._path = null;

    /**
     * Tooltip for currently selected state
     * @type {Selection}
     * @private
     */
    this._tooltip = null;
  }

  /**
   * Define map projection settings.
   *
   * Defines the geometrical map projection of Germany and creates the geometrical paths which are described by the geometrical projection.
   */
  defineSettings()
  {
    // Map projection
    if (!this._proj) {
      this._proj = d3.geoMercator()
        .center(Global.GEO_CENTER) // Geometrical centre of Germany
        .scale(Global.GEO_SCALE)
        .rotate([0, 0])
        .translate([this._width / 2, this._height / 2]);
    }

    // Path generator
    if (!this._path) {
      this._path = d3.geoPath()
        .projection(this._proj);
    }

    // Tooltip
    if (!this._tooltip) {
      this._tooltip = d3.select(".map")
        .append("div")
        .attr("class", "map__tooltip")
        .style("visibility", "hidden");
    }
  }

  /**
   * Read data and render map.
   *
   * Reads the given CSV and GeoJSON data and renders the map, based on the given data sets. Also defines the listener on user interactions.
   * @private
   */
  _renderMap()
  {
    // Loop through CSV dataset
    d3.csv(this._data).then(data =>
    {
      // Set color domain
      this._colors.domain([
        d3.min(data, d => { if (d[""] === this._key_y) return +d[this._key_x]; }),
        d3.max(data, d => { if (d[""] === this._key_y) return +d[this._key_x]; })
      ]);

      d3.json(this._geo).then(json =>
      {
        // Reset current total number of data
        this._total_count = 0;

        // Merge CSV with GeoJSON data
        for (let currentData of data)
        {
          // Get state name
          let dataState = currentData.state;

          // Get data value
          let value = +currentData[this._key_x];

          if (currentData[""] !== this._key_y) {
            continue;
          }

          // Add data value
          this._total_count += value;

          // Find state in GeoJSON data and set value
          for (let feature in json.features)
          {
            if (!json.features.hasOwnProperty(feature)) continue;

            // Get json state name
            let jsonState = json.features[feature].properties[Global.GEO_KEY_NAME];

            // Copy value into json
            if (dataState === jsonState) {
              json.features[feature].properties.value = value;
              break;
            }
          }
        }

        // Set state paths
        this._svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attrs({
            "class": "map__path",
            "d": this._path
          })

          // Listener for hovering over the current path
          .on("mouseover", d => {

            // Set tooltip content
            let state = d.properties[Global.GEO_KEY_NAME];
            let value = d.properties.value;
            let prct = Math.round((value / this._total_count) * 10000) / 100;
            this._tooltip.html(`<div>${state}</div>${value} (${prct}%)`);

            // Render chart
            this._chart.render(state);

            // Display chart
            this._chart.style("visibility", "visible");
            this._chart.style("opacity", 1);

            // Display tooltip
            return this._tooltip.style("visibility", "visible");
          })

          // Listener for moving the mouse
          .on("mousemove", () => {

            // Move tooltip
            return this._tooltip.style("top", (event.pageY-10) + "px")
              .style("left", event.pageX + "px");
          })

          // Listener for leaving the current path
          .on("mouseout", () => {

            // Hide chart
            this._chart.style("visibility", "hidden");
            this._chart.style("opacity", 0);

            // Hide tooltip
            return this._tooltip.style("visibility", "hidden");
          });

        // Fill states with color
        this._svg.selectAll("path")
          .transition()
          .style("fill", d => {
            let val = d.properties.value;
            return val ? this._colors(val) : Global.STATE_DEFAULT_COLOR;
          });
      });
    });
  }

  /**
   * Define settings and render map.
   *
   * Creates the svg element if it does not exist, defines the map projection settings and renders the map with the D3 framework.
   */
  render()
  {
    // Create svg element
    if (this._svg == null) {
      this._svg = d3.select(Global.MAP_SELECTOR)
        .append("svg")
        .attrs({
          "width": this._width,
          "height": this._height
        });
    }

    // Set width of visualization controls
    $(Global.CONTROLS_SELECTOR).css('width', this._width + "px");

    // Define map projection settings
    this.defineSettings();

    // Render map
    this._renderMap();
  }

  /**
   * Get or set data
   * @param value
   * @returns {*}
   */
  data(value)
  {
    if (!arguments.length) return this._data;
    this._data = value;
    return this;
  }

  /**
   * Get or set geo data
   * @param value
   * @returns {*}
   */
  geo(value)
  {
    if (!arguments.length) return this._geo;
    this._geo = value;
    return this;
  }

  /**
   * Get or set x key
   * @param value
   * @returns {*}
   */
  key_x(value)
  {
    if (!arguments.length) return this._key_x;
    this._key_x = value;
    return this;
  }

  /**
   * Get or set y key
   * @param value
   * @returns {*}
   */
  key_y(value)
  {
    if (!arguments.length) return this._key_y;
    this._key_y = value;
    return this;
  }

  /**
   * Get or set chart
   * @param value
   * @returns {*}
   */
  chart(value)
  {
    if (!arguments.length) return this._chart;
    this._chart = value;
    return this;
  }
}
