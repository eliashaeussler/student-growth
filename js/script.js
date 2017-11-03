// Reference to CSV data source file
var DATA_FILE = "";

// Reference to GeoJSON data source file
var GEO_FILE = "../data/de-states.json";



// ======================== jQuery FUNCTIONS ========================

$(function()
{
	// jQuery is ready.


	// Spinner settings
	var spin_opts = {
		color: '#111',
		zIndex: 0
	};

	// Create and display spinner
	var spinner = new Spinner(spin_opts).spin();
	$('#fullscreen').append(spinner.el);

	/*
	 * Get data information and start visualization.
	 *
	 * Tries to read the information data file which contains all information which are needed
	 * to start the visualization.
	 */
	var getDataInformation = function()
	{
		// Get data information written in info-file
		$.ajax({
			type: "get",
			cache: false,
			url: "data/info"
		})
		.done(function(result)
		{
			// Request sucessfully sent.


			// Split result string into sections by new line
			result = result.split('\n');

			// Read information from ajax request
			var title = result[0];
			var author = result[1];
			var data_url = result[2];
			var file = result[3];
			var keys_x = result[4];
			var keys_y = result[5];

			// Modify information (remove unnecessary information)
			title = formatData(title, 'title');
			author = formatData(author, 'author');
			data_url = formatData(data_url, 'url');
			file = formatData(file, 'file');
			keys_x = formatData(keys_x, 'keys_x');
			keys_y = formatData(keys_y, 'keys_y');

			// Set data file
			DATA_FILE = "../" + file;

			// Set data keys (from csv data file)
			keys_x = keys_x.split(';');
			keys_y = keys_y.split(';');
			for(var i in keys_x) keys_x[i] = keys_x[i].split(',');
			for(var i in keys_y) keys_y[i] = keys_y[i].split(',');

			// Display data information
			$('#data-info').html
			(
				'<h1>' + title + '</h1>' +
				'<p>' +
					'Herausgeber: ' + author + '<br />' +
					'<a href="' + data_url + '" target="_blank">Quell-Datensatz herunterladen</a>' +
				'</p>'
			);

			// Display visualization options
			$('#viz-control').html(function() {

				var keys = ["key_x_0", "key_x_1", "key_y"];
				var attr = [keys_x[0], keys_x[1], keys_y[1]];
				var output = "";

				// Display select boxes for each x and y key
				for (var i=0; i < keys.length; i++)
				{
					output += '<select name="' + keys[i] + '" id="' + keys[i] + '" onchange="update();">';
					for(var j=0; j < attr[i].length; j++) {
						output += '<option value="' + attr[i][j] + '">' + attr[i][j] + '</option>';
					}
					output += '</select> ';
				}

				return output;

			});

			// Start visualization, then hide spinner
			$.when(
				map.data(DATA_FILE),
				chart.data(DATA_FILE),
				update()
			).done(closeFullscreen);

			// Change document title
			document.title = "Visualisierung: " + title;
		})
		.fail(function()
		{
			// Ajax request not successful.


			// Display error
			$('#data-info').html
			(
				'<h1>Die Daten wurden noch nicht heruntergeladen.</h1>' +
				'<div class="error">' +
					'<p>' +
						'<strong>Bitte führen Sie folgende Schritte durch, um die Visualisierung zu starten:</strong>' +
					'</p>' +
					'<p>' +
						'<ol>' +
							'<li>' +
								'Öffnen Sie ein Terminal.' +
							'</li>' +
							'<li>' +
								'Wechseln Sie in das Stammverzeichnis dieser Projektarbeit:<br />' +
								'<code>cd &lt;Verzeichnis&gt;</code>' +
							'</li>' +
							'<li>' +
								'Laden Sie den Datensatz herunter:<br />' +
								'<code>python3 download.py</code>' +
							'</li>' +
							'<li>' +
								'Klicken Sie auf "Aktualisieren", um die Visualisierung zu starten.' +
							'</li>' +
						'</ol>' +
					'</p>' +
					'<p>' +
						'<button onclick="window.location.reload()">Aktualisieren</button>' +
					'</p>' +
				'</div>'
			);

			// Hide main content to avoid displaying top and bottom borders and padding
			$('main').hide();

			// Hide spinner
			closeFullscreen();
		});
	}();

	// Close fullscreen
	var closeFullscreen = function()
	{
		var scr = $('#fullscreen');
		$(scr).find('*').delay(300).fadeOut(300);
		$(scr).delay(300).fadeOut(600);
	}

	// Format data (remove given key, whitespaces and non-visible characters such as line-breaks)
	var formatData = function(data, key)
	{
		data = data.replace(key + ': ', '');
		data = data.replace('\n', '');
		data = data.replace('\r', '');
		data = data.replace('\t', '');

		return data;
	}
});



// ==================== VISUALIZATION FUNCTIONS ====================

/*
 * Map visualization.
 *
 * Contains all relevant information and functions in relation to the map visualization with the D3 framework.
 */
var Map = function()
{
	// Map object
	var _map = {},

	// Reference to chart
	_chart,

	// Width and height of svg element
	_width = 600,
	_height = 700,

	// CSV data from source
	_data = [],

	// GeoJSON data from source
	_geo = [],

	// Colors for states
	_colors = d3.scale.quantize()
		.range(["#ffecb3", "#ffe082", "#ffd54f",
				 "#ffca28", "#ffc107", "#ffb300",
				 "#ffa000", "#ff8f00", "#ff6f00"]),

	// Current selected x and y keys
	_key_x,
	_key_y,

	// Total number of data with current selected keys
	_total_count,

	// Reference to svg element
	_svg,

	// Projection of dataset
	_proj,

	// Map paths
	_path,

	// Tooltip for current selected state
	_tooltip;


	/*
	 * Define settings and render map.
	 *
	 * Creates the svg element if it does not exist, defines the map projection settings and renders
	 * the map with the D3 framework.
	 */
	_map.render = function()
	{
		// Create svg element
		if (!_svg) {
			_svg = d3.select("#viz-map")
				.append("svg")
				.attr("width", _width)
				.attr("height", _height);
		}

		// Set width of visualization controls
		$('#viz-control').css('width', _width + "px");

		// Define map projection ettings
		defineSettings();

		// Render map
		renderMap();
	}

	/*
	 * Define map projection settings.
	 *
	 * Defines the geometrical map projection of Germany and creates the geometrical paths which are
	 * described by the geometrical projection.
	 */
	var defineSettings = function()
	{
		// Map projection
		if (!_proj)
			_proj = d3.geo.mercator()
				.center([10.45, 51.16]) // Geometrical centre of Germany
				.scale(2800)
				.rotate([0, 0])
				.translate([_width / 2, _height / 2]);

		// Path generator
		if (!_path)
			_path = d3.geo.path()
				.projection(_proj);

		// Tooltip
		if (!_tooltip)
			_tooltip = d3.select("body")
				.append("div")
				.attr("class", "tooltip")
				.style("visibility", "hidden");
	}	

	/*
	 * Read data and render map.
	 *
	 * Reads the given CSV and GeoJSON data and renders the map, based on the given datasets.
	 * Also defines the listener on user interactions.
	 */
	var renderMap = function()
	{
		// Loop through CSV dataset
		d3.csv(_data, function(data) {

			// Set color domain
			_colors.domain([
				d3.min(data, function(d) { if (d[""] == _key_y) return +d[_key_x]; }),
				d3.max(data, function(d) { if (d[""] == _key_y) return +d[_key_x]; })
			]);

			// Load in GeoJSON data
			d3.json(_geo, function(json) {

				// Reset current total number of data
				_total_count = 0;

				// Merge CSV with GeoJSON data
				for(var i=0; i < data.length; i++)
				{
					// Get state name
					var dataState = data[i]["state"];

					// Get data value
					var value = +data[i][_key_x];

					if (data[i][""] == _key_y)
					{
						// Add data value
						_total_count += value;

						// Find state in GeoJSON data and set value
						for(var j=0; j < json.features.length; j++)
						{
							// Get json state name
							var jsonState = json.features[j].properties.NAME_1;

							// Copy value into json
							if (dataState === jsonState)
							{
								json.features[j].properties.value = value;
								break;
							}
						}
					}
				}

				// Set state paths
				_svg.selectAll("path")
					.data(json.features)
					.enter()
					.append("path")
					.attr("d", _path)

					// Listener for hovering over the current path
					.on("mouseover", function(d) {

						// Set tooltip content
						var state = d.properties.NAME_1;
						var value = d.properties.value;
						var prct = Math.round((value / _total_count) * 10000) / 100;
						_tooltip.html("<div>" + state + "</div>" + value + " (" + prct + "%)");

						// Render chart
						_chart.renderChart(state);

						// Display chart
						_chart.style("visibility", "visible");
						_chart.style("opacity", 1);

						// Display tooltip
						return _tooltip.style("visibility", "visible");

					})

					// Listener for moving the mouse
					.on("mousemove", function() {

						// Move tooltip
						return _tooltip.style("top", (event.pageY-10) + "px")
									   .style("left", event.pageX + "px");

					})

					// Listener for leaving the current path
					.on("mouseout", function() {

						// Hide chart
						_chart.style("visibility", "hidden");
						_chart.style("opacity", 0);

						// Hide tooltip
						return _tooltip.style("visibility", "hidden");

					});

				// Fill states with color
				_svg.selectAll("path")
					.transition()
					.style("fill", function(d) {

						var val = d.properties.value;
						return val ? _colors(val) : "#aaa";

					});

			});

		});
	}

	// Get or set data
	_map.data = function(d) {
        if (!arguments.length) return _data;
        _data = d;
        return _map;
    };

	// Get or set geo data
	_map.geo = function(g) {
        if (!arguments.length) return _geo;
        _geo = g;
        return _map;
    };

	// Get or set x key
	_map.key_x = function(k) {
        if (!arguments.length) return _key_x;
        _key_x = k;
        return _map;
    };

	// Get or set y key
	_map.key_y = function(k) {
        if (!arguments.length) return _key_y;
        _key_y = k;
        return _map;
    };

	// Get or set chart
	_map.chart = function(c) {
        if (!arguments.length) return _chart;
        _chart = c;
        return _map;
    };


    return _map;

} // == Map() end ==


/*
 * Chart visualization.
 *
 * Contains all relevant information and functions in relation to the chart visualization with the D3 framework.
 */
var Chart = function()
{
	// Chart object
	var _chart = {},

	// Total width and height
	_w = 700,
	_h = 500,

	// Margins
	_margin = { top: 50, right: 30, bottom: 120, left: 80 },

	// Chart width and height
	_width = _w - _margin.left - _margin.right,
	_height = _h - _margin.top - _margin.bottom,

	// Data from source
	_data = [],

	// Current selected x and y keys
	_key_x,
	_key_y,

	// Reference to svg element
	_svg,

	// Chart title of current selected data (contains the name of the current selected state)
	_title,

	// Chart subtitle (contains the name of the current selected keys)
	_subtitle,

	// Chart path and line
	_path,
	_line,

	// Graphics element of chart and axes
	_g,
	_gX,
	_gY,

	// x and y points of data
	_x,
	_y,

	// x and y axis
	_xAxis,
	_yAxis;


	/*
	 * Define settings and render chart.
	 *
	 * Creates the svg element and the graphics elements if they do not exist, create the chart title element and
	 * defines the map projection settings.
	 */
	_chart.render = function()
	{
		// Create svg chart element
		if (!_svg)
			_svg = d3.select("#viz-chart")
				.append("svg")
				.attr({
					"width": _width + _margin.left + _margin.right,
					"height": _height + _margin.top + _margin.bottom
				})
				.style("visibility", "hidden");

		// Create svg chart axis graphics element
		if (!_gX)
			_gX = _svg.append("g")
				.attr({
					"class": "x axis",
					"transform": "translate(" + _margin.left + ", " + (_height + _margin.top) + ")"
				});
		if (!_gY)
			_gY = _svg.append("g")
				.attr({
					"class": "y axis",
					"transform": "translate(" + _margin.left + ", " + _margin.top + ")"
				});

		// Create svg chart graphics element
		if (!_g)
			_g = _svg.append("g")
				.attr("transform", "translate(" + _margin.left + "," + _margin.top + ")");

		// Create title text
		if (!_title)
			_title = _svg.append("text")
				.attr({
					"x": _margin.left + _width / 2,
					"y": 15,
					"class": "title"
				});

		// Create subtitle text
		if (!_subtitle)
			_subtitle = _svg.append("text")
				.attr({
					"x": _margin.left + _width / 2,
					"y": 40,
					"class": "subtitle"
				});

		// Define Settings
		defineSettings();


		return _chart;
	}

	/*
	 * Define chart projection settings.
	 *
	 * Creates the line generator for the chart and appends the path to the main graphics element.
	 */
	var defineSettings = function()
	{
		// Chart line generator
		if (!_line)
			_line = d3.svg.line()
				.x(function(d) { return _x(d.x); })
				.y(function(d) { return _y(d.y); });

		// Chart path element
		if (!_path)
			_path = _g.append("path");
	}

	/*
	 * Read data and render chart.
	 *
	 * Reads the given CSV renders the chart, based on the given datasets.
	 * Also defines the listener on user interactions.
	 */
	_chart.renderChart = function(value)
	{
		d3.csv(_data, function(data) {

			// Set title
			_title.text(value);

			// Set subtitle
			_subtitle.text(_key_x.replace(" ", " | "));

			// Get and save values
			var _d = [],
				i = 0;
			data.forEach(function(d) {
				if (d["state"] == value) {
					_d.push([]);
					_d[i].x = d[""];
					_d[i++].y = +d[_key_x];
				}
			});

			// Scale the range of the data
			_x = d3.scale.ordinal()
				.rangePoints([0, _width]);
			_y = d3.scale.linear()
				.domain([d3.min(data, function(d) { return +d[_key_x]; }),
						 d3.max(data, function(d) { return +d[_key_x]; })])
				.rangeRound([_height, 0]);

			// Chart X axis
			if (!_xAxis)
				_xAxis = d3.svg.axis()
					.scale(_x)
					.orient("bottom");

			// Chart Y axis
			if (!_yAxis)
				_yAxis = d3.svg.axis()
					.orient("left")
					.ticks(6);

			// Set axes domains
			_x.domain(_d.map(function(d) { return d.x; }));

			// Render x axis
			_gX.call(_xAxis)
				.selectAll("text")
				.style("text-anchor", "end")
				.attr({
					"class": function(d) { return d == _key_y ? "active" : ""; },
					"dx": "-1.4em",
					"dy": ".3em",
					"transform": "rotate(-70)"
				});

			// Render y axis
			_yAxis.scale(_y);
			_gY.call(_yAxis);

			// Add line to chart
			_g.selectAll("path")
				.transition()
				.attr({
					"class": "chart-line",
					"d": _line(_d)
				});
                
			// Add grid lines
			d3.selectAll("g.y g.tick")
				.selectAll("line.grid-line")
				.data([{}])
				.enter()
				.append("line")
				.attr({
					"class": "grid-line",
			    	"x1": 0,
			    	"y1": 0,
			    	"x2": _width,
			    	"y2": 0
				});

			// Edit data
			var tmp = [];
			data.forEach(function(d) {
				if (d["state"] == value) {
					tmp.push({
						x: _x(d[""]),
						y: _y(d[_key_x]),
						active: d[""] == _key_y
					});
				}
			});

			// Render dots
			_g.selectAll("circle")
				.data(tmp)
				.enter()
				.append("circle");

			_g.selectAll("circle")
				.data(tmp)
				.transition()
				.attr({
					"cx": function(d) { return d.x; },
					"cy": function(d) { return d.y; },
					"r": 4.5,
					"class": function(d) { return "dot" + (d.active ? " active" : ""); }
				});

		});
	}

	// Get or set data
	_chart.data = function(d) {
        if (!arguments.length) return _data;
        _data = d;
        return _chart;
    };

	// Get or set x key
	_chart.key_x = function(k) {
        if (!arguments.length) return _key_x;
        _key_x = k;
        return _chart;
    };

	// Get or set y key
	_chart.key_y = function(k) {
        if (!arguments.length) return _key_y;
        _key_y = k;
        return _chart;
    };

    // Set style
    _chart.style = function(setting, value) {
    	if (arguments.length == 1) return _svg.style(setting);
        _svg.style(setting, value);
        return _chart;
    }


    return _chart;

} // == Chart() end ==


/*
 * Update svg graphics.
 *
 * Reads the user selected keys, changes the svg graphics (map and chart) and starts rendering them.
 */
var update = function()
{
	// Read and format keys
	var key_x_0 = $('#key_x_0 :selected').val();
	var key_x_1 = $('#key_x_1 :selected').val();
	var key_x = key_x_0 + ' ' + key_x_1;
	var key_y = $('#key_y :selected').val();

	// Set keys
	map.key_x(key_x)
	   .key_y(key_y);
	chart.key_x(key_x)
		 .key_y(key_y);

	// Render map
	map.render();
}



// ================== MAIN PART (SET SVG GRAPHICS) ==================

// Init chart
var chart = Chart()
	.data(DATA_FILE)
	.render();

// Init map
var map = Map()
	.data(DATA_FILE)
	.geo(GEO_FILE)
	.chart(chart);