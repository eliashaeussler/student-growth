/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */

let { Spinner } = require('spin.js');

export class Data
{
  /**
   *
   * @param map {Map}
   * @param chart {Chart}
   */
  constructor(map, chart)
  {
    /**
     * The initialized Map
     * @type {Map}
     */
    this.map = map;

    /**
     * The initialized Chart
     * @type {Chart}
     */
    this.chart = chart;

    /**
     * Reference to CSV data source file
     * @type {string}
     */
    this.dataFile = "";

    // Initialize spinner, get data information and render map and chart
    this.initSpinner();
    this.getDataInformation();
  }

  /**
   * Initialize spinner for given element and options
   * @param opts
   */
  initSpinner(opts)
  {
    let spinner_opts = opts || {
      color: '#111',
      zIndex: 0
    };
    let spinner = new Spinner(spinner_opts).spin();
    $(Global.FULLSCREEN_SELECTOR).append(spinner.el);
  }

  /**
   * Get data information and start visualization
   * Tries to read the information data file which contains all information which are needed to start the visualization.
   */
  getDataInformation()
  {
    // Get data information written in info file
    $.ajax({
      dataType: "json",
      type: "get",
      cache: false,
      url: Global.INFO_FILE
    })
      .done(data =>
      {
        this.data = data;

        // Set data file
        this.dataFile = data.file;

        // Display data information
        $(Global.DATA_INFO_SELECTOR).html
        (
          `<h1>${data.title}</h1>
<p>
  Publisher: ${data.author}<br />
  <a href="${data.url}" target="_blank">Download source data</a>
</p>`
        );

        // Display visualization options
        let attributes = ["nationality", "sex", "semester"];
        $(Global.CONTROLS_SELECTOR).html(() => {

          let output = "";

          // Display select boxes for each x and y key
          for (let key of attributes)
          {
            if (!data.attributes.hasOwnProperty(key)) continue;

            output += `<select name="${key}" id="${key}">`;
            for (let attr of data.attributes[key]) {
              output += `<option value="${attr}">${attr}</option>`;
            }
            output += `</select> `;
          }

          return output;
        });

        // Register Change events for visualization options
        for (let key of attributes)
        {
          $(`#${key}`).on('change', () => { this.update(); });
        }

        // Start visualization, then hide spinner
        $.when(
          this.map.data(this.dataFile),
          this.chart.data(this.dataFile),
          this.update()
        ).done(this.closeFullscreen);

        // Change document title
        document.title = `${document.title}: ${data.title}`;
      })
      .fail(() => {
        // Display error
        $(Global.DATA_INFO_SELECTOR).html
        (
          `<h1>Data is not available yet.</h1>
<div class="error">
  <p>
    <strong>Please follow these steps to get the latest data:</strong>
  </p>
  <p>
    <ol>
      <li>
        Open a command line.
      </li>
      <li>
        Change to the root directory of this project:<br />
        <code>cd /path/to/students-viz</code>
      </li>
      <li>
        Download the latest data set using Python:<br />
        <code>python3 download.py</code>
      </li>
      <li>
        Click "Refresh" to start the visualization.
      </li>
    </ol>
  </p>
  <p>
    <button onclick="window.location.reload()">Refresh</button>
  </p>
</div>`
        );

        // Hide main content to avoid displaying top and bottom borders and padding
        $('main').hide();

        // Hide spinner
        this.closeFullscreen();
      });
  }

  /**
   * Update svg graphics
   * Reads the user selected keys, changes the svg graphics (map and chart) and starts rendering them.
   */
  update()
  {
    // Read and format keys
    let nationality = $('#nationality :selected').val();
    let sex = $('#sex :selected').val();
    let key_x = `${nationality} ${sex}`;
    let key_y = $('#semester :selected').val();

    // Set keys
    this.map.key_x(key_x).key_y(key_y);
    this.chart.key_x(key_x).key_y(key_y);

    // Render map
    this.map.render();
  }

  /**
   * Close fullscreen
   */
  closeFullscreen()
  {
    let scr = $(Global.FULLSCREEN_SELECTOR);
    $(scr).find('*').delay(300).fadeOut(300);
    $(scr).delay(300).fadeOut(600);
  }
}
