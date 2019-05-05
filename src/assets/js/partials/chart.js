/*
 * Copyright (c) 2019 Elias Häußler <elias@haeussler.dev>. All rights reserved.
 */

/**
 * Chart visualizing the student growth of any state in Germany during the last years.
 *
 * Visualizes the student growth in Germany of a specific state during the last years. The visualization is done by a
 * line chart using the D3 framework. The chart will only be visible if the user moves its mouse over any state on the
 * map. When hovering a state, the chart is being generated and will be visible.
 */
export class Chart
{
  /**
   * Initialize line chart visualization.
   *
   * Defines some general settings regarding the line chart visualization.
   */
  constructor()
  {
    /**
     * Chart object
     * @type {Object}
     * @private
     */
    this._chart = {};

    /**
     * Aspect ratio of the chart (height / width)
     * @type {number}
     * @private
     */
    this._aspectRatio = 0.7;

    /**
     * Total width
     * @type {number}
     * @private
     */
    this._w = 650;

    /**
     * Total height
     * @type {number}
     * @private
     */
    this._h = this._w * this._aspectRatio;

    /**
     * Margins
     * @type {object}
     * @private
     */
    this._margin = {
      top: 50,
      right: 30,
      bottom: 70,
      left: 50
    };

    /**
     * Chart width
     * @type {number}
     * @private
     */
    this._width = this._w - this._margin.left - this._margin.right;

    /**
     * Chart height
     * @type {number}
     * @private
     */
    this._height = this._h - this._margin.top - this._margin.bottom;

    /**
     * Data from source
     * @type {Array}
     * @private
     */
    this._data = [];

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
     * Reference to svg element
     * @type {Selection}
     * @private
     */
    this._svg = null;

    /**
     * Reference to main graphics element
     * @type {Selection}
     * @private
     */
    this._g = null;

    /**
     * Chart title of current selected data (contains the name of the current selected state)
     * @type {string}
     * @private
     */
    this._title = "";

    /**
     * Chart subtitle (contains the name of the current selected keys)
     * @type {string}
     * @private
     */
    this._subtitle = "";

    /**
     * Chart path
     * @type {Selection}
     * @private
     */
    this._path = null;

    /**
     * Chart line
     * @type {line}
     * @private
     */
    this._line = null;

    /**
     * Graphics element of chart
     * @type {Selection}
     * @private
     */
    this._gChart = null;

    /**
     * Graphics element of x axis
     * @type {Selection}
     * @private
     */
    this._gX = null;

    /**
     * Graphics element of y axis
     * @type {Selection}
     * @private
     */
    this._gY = null;

    /**
     * x points of data
     * @type {continuous}
     * @private
     */
    this._x = null;

    /**
     * y points of data
     * @type {continuous}
     * @private
     */
    this._y = null;

    /**
     * x axis
     * @type {axis}
     * @private
     */
    this._xAxis = null;

    /**
     * y axis
     * @type {axis}
     * @private
     */
    this._yAxis = null;
  }

  /**
   * Define chart projection settings.
   *
   * Creates the line generator for the chart and appends the path to the main graphics element.
   */
  defineSettings()
  {
    // Chart line generator
    if (!this._line)
      this._line = d3.line()
        .x(d => this._x(d.x))
        .y(d => this._y(d.y));

    // Chart path element
    if (!this._path) {
      this._path = this._gChart.append("path");
    }
  }

  /**
   * Read data and render chart.
   *
   * Reads the given CSV data and renders the chart, based on the given data sets. It also defines the listener on user interactions.
   * @param value
   */
  render(value)
  {
    d3.csv(this._data).then(data => {

      // Set title
      this._title.text(value);

      // Set subtitle
      this._subtitle.text(this._key_x.replace(" ", " | "));

      // Get and save values
      let _d = [], i = 0;
      for (let currentData of data) {
        if (currentData.state === value) {
          _d.push([]);
          _d[i].x = currentData[Global.DATA_KEY_SEMESTER];
          _d[i++].y = +currentData[this._key_x];
        }
      }

      // Scale the range of the data
      this._x = d3.scalePoint()
        .range([0, this._width]);
      this._y = d3.scaleLinear()
        .domain([d3.min(data, d => +d[this._key_x]),
          d3.max(data, d => +d[this._key_x])])
        .rangeRound([this._height, 0]);

      // Chart X axis
      if (!this._xAxis) {
        this._xAxis = d3.axisBottom(this._x);
      }

      // Chart Y axis
      if (!this._yAxis) {
        this._yAxis = d3.axisLeft()
          .ticks(6);
      }

      // Set axes domains
      this._x.domain(_d.map(d => d.x));

      // Render x axis
      this._gX.call(this._xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attrs({
          "class": d => "chart__text" + (d === this._key_y ? " chart__text--active" : ""),
          "dx": "-1.4em",
          "dy": "0.3em",
          "transform": "rotate(-70)"
        });

      // Render y axis
      this._yAxis.scale(this._y);
      this._gY.call(this._yAxis)
        .selectAll("text")
        .attr("class", "chart__text");

      // Add line to chart
      this._gChart.selectAll("path")
        .transition()
        .attrs({
          "class": "chart__line",
          "d": this._line(_d)
        });

      // Add grid lines
      d3.selectAll("g.chart__axis--y g.tick")
        .selectAll(".chart__line--grid")
        .data([{}])
        .enter()
        .append("line")
        .attrs({
          "class": "chart__line--grid",
          "x1": 0,
          "y1": 0,
          "x2": this._width,
          "y2": 0
        });

      // Edit data
      let tmp = [];
      for(let currentData of data) {
        if (currentData.state === value) {
          tmp.push({
            x: this._x(currentData[Global.DATA_KEY_SEMESTER]),
            y: this._y(currentData[this._key_x]),
            active: currentData[Global.DATA_KEY_SEMESTER] === this._key_y
          });
        }
      }

      // Render dots
      this._gChart.selectAll("circle")
        .data(tmp)
        .enter()
        .append("circle");

      this._gChart.selectAll("circle")
        .data(tmp)
        .transition()
        .attrs({
          "cx": d => d.x,
          "cy": d => d.y,
          "r": 4.5,
          "class": d => "chart__dot" + (d.active ? " chart__dot--active" : "")
        });
    });
  }

  /**
   * Define settings and render chart.
   *
   * Creates the svg and graphics elements if they do not exist and the chart title element.
   * Defines the map projection settings afterwards.
   */
  init()
  {
    // Create svg chart element
    if (this._svg == null) {
      this._svg = d3.select(Global.CHART_SELECTOR)
        .append("svg")
        .attrs({
          "width": "100%",
          "height": "100%",
          "viewBox": `0 0 ${this._width + this._margin.left + this._margin.right} ${this._height + this._margin.top + this._margin.bottom}`
        })
        .style("visibility", "hidden");
    }

    // Create main graphics element
    if (this._g == null) {
      this._g = this._svg.append("g");
    }

    // Create svg chart axis graphics element
    if (this._gX == null) {
      this._gX = this._g.append("g")
        .attrs({
          "class": "chart__axis chart__axis--x",
          "transform": "translate(" + this._margin.left + ", " + (this._height + this._margin.top) + ")"
        });
    }

    if (this._gY == null) {
      this._gY = this._g.append("g")
        .attrs({
          "class": "chart__axis chart__axis--y",
          "transform": "translate(" + this._margin.left + ", " + this._margin.top + ")"
        });
    }

    // Create svg chart graphics element
    if (this._gChart == null) {
      this._gChart = this._g.append("g")
        .attr("transform", "translate(" + this._margin.left + "," + this._margin.top + ")");
    }

    // Create title text
    if (!this._title) {
      this._title = this._g.append("text")
        .attrs({
          "x": this._margin.left + this._width / 2,
          "y": 15,
          "class": "chart__title"
        });
    }

    // Create subtitle text
    if (!this._subtitle) {
      this._subtitle = this._g.append("text")
        .attrs({
          "x": this._margin.left + this._width / 2,
          "y": 40,
          "class": "chart__subtitle"
        });
    }

    // Define Settings
    this.defineSettings();

    return this;
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
   * Set style
   * @param setting
   * @param value
   * @returns {*}
   */
  style(setting, value)
  {
    if (arguments.length === 1) return this._svg.style(setting);
    this._svg.style(setting, value);
    return this;
  }
}
