/*
 * Copyright (c) 2018 Elias Häußler <mail@elias-haeussler.de> (www.elias-haeussler.de).
 */

/**
 * Visualization Data Provider and Initializer.
 *
 * Provides multiple data which is needed for both map and chart visualization of student growth in Germany in the last
 * years. The class is also used to initialize the visualization. It serves as interface and data collector/provider
 * between visualization classes and functions.
 */
export class Controller
{
  /**
   * Read data information and initialize map and chart visualization.
   *
   * Reads the data information specified by a local information file and renders both visualizations based on these
   * information. Note that both the map and chart visualization needs to be initialized and provided when calling this
   * constructor.
   *
   * @param map {VisualizationMap}
   * @param chart {Chart}
   */
  constructor(map, chart)
  {
    /**
     * The initialized Map
     * @type {VisualizationMap}
     */
    this.map = map;

    /**
     * The initialized Chart
     * @type {Chart}
     */
    this.chart = chart;

    // Initialize spinner, get data information and render map and chart
    Controller.initSpinner();
    this.getDataInformation();
  }

  /**
   * Initialize spinner to show load state of visualizations.
   *
   * Initializes and renders a spinner which demonstrates the load state of both visualizations.
   */
  static initSpinner()
  {
    // Hide page
    Controller.hidePage();

    // Markup from Spinkit
    let spinner = `<div class="sk-wave">
        <div class="sk-rect sk-rect1"></div>
        <div class="sk-rect sk-rect2"></div>
        <div class="sk-rect sk-rect3"></div>
        <div class="sk-rect sk-rect4"></div>
        <div class="sk-rect sk-rect5"></div>
      </div>`;

    let additionalClass = "spinner";
    $(Global.FULLSCREEN_SELECTOR).html(spinner).find('> div').addClass(additionalClass);
  }

  /**
   * Get data information and start visualization.
   *
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

            output += `<select name="${key}" class="controls__${key}">`;
            for (let attr of data.attributes[key]) {
              output += `<option value="${attr}">${attr}</option>`;
            }
            output += `</select> `;
          }

          return output;
        });

        // Register Change events for visualization options
        for (let key of attributes) {
          $(`.controls__${key}`).on('change', () => { this.update(); });
        }

        // Check if cookie for device-notice is set
        Controller.initDeviceNotice();

        // Check if settings are defined inside URL
        let settingsByUrl = Controller.getSettingsByUrlFragments();
        for (let setting of Object.keys(settingsByUrl))
        {
          let value = settingsByUrl[setting];
          if (value === null) break;
          let $selectField = $(`.controls__${setting}`);
          if (!$selectField.length) break;

          // Find value for normalized string of semester
          if (setting === "semester") {
            value = Controller.findValueByNormalizedString($selectField, value);
          }

          // Set selection for selected value
          if ($selectField.find(`option[value="${value}"]`).length) {
            $selectField.val(value);
          }
        }

        // Start visualization, then hide spinner
        $.when(
          this.map.data(data.file),
          this.chart.data(data.file),
          this.update()
        ).done(Controller.closeFullscreen);

        // Add event for confirm button of device notice
        $(Global.DEVICE_NOTICE_CONFIRM_SELECTOR).on('click', () => { Controller.hideDeviceNotice(); });

        // Change document title
        document.title = `${document.title}: ${data.title}`;
      })
      .fail(() =>
      {
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
        <code>cd /path/to/student-growth</code>
      </li>
      <li>
        Download the latest data set using Python:<br />
        <code>python3 bin/download.py</code>
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
        Controller.closeFullscreen();
      })
      .always(() =>
      {
        // Show page
        Controller.showPage();
      });
  }

  /**
   * Update svg graphics.
   *
   * Reads the user selected keys, changes the svg graphics (map and chart) and starts rendering them.
   */
  update()
  {
    // Read and format keys
    let nationality = $('.controls__nationality :selected').val();
    let sex = $('.controls__sex :selected').val();
    let key_x = `${nationality} ${sex}`;
    let key_y = $('.controls__semester :selected').val();

    // Set keys
    this.map.key_x(key_x).key_y(key_y);
    this.chart.key_x(key_x).key_y(key_y);

    // Render map
    this.map.render();

    // Update URL path
    Controller.updateUrl(nationality, sex, key_y);
  }

  /**
   * Close fullscreen.
   *
   * Hides the fullscreen which is being used to demonstrate the load state of both visualizations.
   */
  static closeFullscreen()
  {
    let scr = $(Global.FULLSCREEN_SELECTOR);
    $(scr).find('*').delay(300).fadeOut(300);
    $(scr).delay(300).fadeOut(600);
  }

  /**
   * Hide page.
   *
   * Hides the page wrapper which includes all page contents.
   */
  static hidePage()
  {
    $(Global.PAGE_WRAPPER_SELECTOR).hide();
  }

  /**
   * Show page.
   *
   * Makes the page wrapper visible which includes all page contents.
   */
  static showPage()
  {
    $(Global.PAGE_WRAPPER_SELECTOR).show();
  }

  /**
   * Initialize device notice.
   *
   * Checks whether the device notice confirmation cookie is already set. If true, the appropriate class is being added to the body element.
   */
  static initDeviceNotice()
  {
    // Read all cookies
    let cookies = document.cookie.split(';').filter(c => c.length > 0);

    // Set confirm class if cookie is already set
    if (cookies.some(c => c.indexOf(`${Global.DEVICE_NOTICE_COOKIE}=`) >= 0)) {
      $('body').addClass(Global.DEVICE_NOTICE_CONFIRMED_CLASS);
    }
  }

  /**
   * Hide device notice.
   *
   * Sets the device notice confirmation cookie and adds the appropriate class to the body element.
   */
  static hideDeviceNotice()
  {
    // Set cookie
    document.cookie = `${Global.DEVICE_NOTICE_COOKIE}=true`;

    // Add class to hide device notice
    $('body').addClass(Global.DEVICE_NOTICE_CONFIRMED_CLASS);
  }

  /**
   * Update page URL with given settings from controls.
   *
   * Adds the selected options from controls as fragments to the current page URL. This enables sharing the current
   * setting with others.
   *
   * @param nationality Selected value for nationality
   * @param sex Selected value for sex
   * @param semester Selected value for semester
   */
  static updateUrl(nationality, sex, semester)
  {
    // Generate URI-encoded strings
    nationality = Controller.encodeUrlFragment(nationality);
    sex = Controller.encodeUrlFragment(sex);
    semester = Controller.encodeUrlFragment(Controller.getNormalizedString(semester));

    // Replace current URL with fragments of selected values
    window.history.replaceState(null, document.title, `/#!/${nationality}/${sex}/${semester}`);
  }

  /**
   * Read settings by current URL.
   *
   * Reads the settings which are provided through fragments of the current URL and returns them as object. If at least
   * one setting is not defined within the URL, all values inside the object will be NULL.
   *
   * @returns {{nationality: string|null, sex: string|null, semester: string|null}}
   */
  static getSettingsByUrlFragments()
  {
    let settings = {
      nationality: null,
      sex: null,
      semester: null
    };

    // Read URL fragments and decode them to create usable values
    let hash = document.location.hash.substr(3);
    if (hash) {
      let fragments = hash.split('/');
      if (fragments && fragments.length >= 3) {
        settings.nationality = this.decodeUrlFragment(fragments[0].trim());
        settings.sex = this.decodeUrlFragment(fragments[1].trim());
        settings.semester = this.decodeUrlFragment(fragments[2].trim());
      }
    }

    return settings;
  }

  /**
   * URI-encode a URL fragment.
   *
   * @param fragment The fragment which should be URI-encoded
   * @returns {*} The URI-encoded fragment
   */
  static encodeUrlFragment(fragment)
  {
    if (!fragment) return fragment;
    return encodeURI(fragment.replace('/', '-'));
  }

  /**
   * URI-decode a URL fragment.
   *
   * @param fragment The URI-encoded fragment which should be URI-decoded
   * @returns string The URI-decoded fragment
   */
  static decodeUrlFragment(fragment)
  {
    if (!fragment) return fragment;
    return decodeURI(fragment).replace('-', '/');
  }

  /**
   * Create normalized string by a given value.
   *
   * Creates a normalized string by a given value by removing all characters until the first space.
   *
   * @param string The string which should be normalized
   * @returns string The normalized string
   */
  static getNormalizedString(string)
  {
    if (!string) return string;
    return string.replace(/^(.*?)\s/g, '');
  }

  /**
   * Check whether inside a select field an option with a given normalized value exists.
   *
   * Checks all options of a given select field for the occurrence of a given normalized string. For this, all option
   * values within the given selected field will be normalized and compared with the given normalized string. If any
   * normalized option value matches the given normalized string, its real value will be returned. Otherwise, the return
   * value equals the given normalized string.
   *
   * @param $selectField jQuery select field which should contain an option with matching normalized string value
   * @param normalizedString The normalized string to search for inside the given select field's options
   * @returns string The real value of an option whose normalized value matches the given normalized string;
   *                 or the normalized string if no normalized option value matches the given string
   */
  static findValueByNormalizedString($selectField, normalizedString)
  {
    if (!$selectField.length) return normalizedString;

    // Check if any normalized option value matches the given normalized string
    let value = normalizedString;
    $selectField.find('option').each(function() {
      let currentValue = $(this).val();
      let normalizedValue = Controller.getNormalizedString(currentValue);
      if (normalizedValue === normalizedString) {
        value = currentValue;
        return false;
      }
    });

    return value;
  }
}
