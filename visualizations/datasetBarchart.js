var drawDatasetsBarChart = function(config) {
	var dataValues = config.data;

	dataValues.forEach(function(bindings) {
		bindings.total = +(parseInt(bindings.triples.value) + parseInt(bindings.duplicates.value));
		var origObject = $.extend({}, bindings);
		bindings.counts = [ {
			name : "# unique triples",
			x0 : +1,
			x1 : +bindings.triples.value
		}, {
			name : "# duplicate triples",
			x0 : +bindings.triples.value,
			x1 : +bindings.total
		} ];

		$.extend(bindings.counts[0], origObject);
		$.extend(bindings.counts[1], origObject);
	});

	dataValues.sort(function(a, b) {
		return b.total - a.total;
	});
	var margin = {
		top : 40,
		right : 20,
		bottom : 30,
		left : 40
	}, width = 960 - margin.left - margin.right, height = (dataValues.length * 3) - margin.top
			- margin.bottom;
	var x = d3.scale.log().range([ 0, width ]).domain(
			[ 1, d3.max(dataValues, function(val) {
				return val.total;
			}) ]);

	var y = d3.scale.ordinal().rangeBands([ 0, height ], .1).domain(
			dataValues.map(function(d) {
				return d.doc.value;
			}));

	var color = d3.scale.ordinal().range([ "#ff8c00", "#98abc5" ]);

	var numberFormat = d3.format(".1s");
	/**
	 * we want to keep the ticks, but not all the labels (as they'll start to
	 * overlap). Use this function instead
	 */
	function logFormat(d) {
		var x = Math.log(d) / Math.log(10) + 1e-6;
		return Math.abs(x - Math.floor(x)) < .4 ? numberFormat(d) : "";
	}

	var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat("");
	// .ticks(10)
	// .tickFormat(d3.format(".1s"));

	var xAxis = d3.svg.axis().scale(x).tickFormat(logFormat).orient("top");

	var tip = d3.tip().attr('class', 'd3-tip').offset([ -10, 0 ]).html(
			function(bindings) {

				return "<i>" + bindings.doc.value+ ":<br> <strong>total triples: </strong>"
						+ formatThousands(bindings.total)
						+ "<br><Strong>unique: </strong>"
						+ formatThousands(bindings.triples.value) + " ("
						+ formatPercentage(bindings.triples.value / bindings.total)
						+ ")<br><Strong>duplicates: </strong>"
						+ formatThousands(bindings.duplicates.value) + " ("
						+ formatPercentage(bindings.duplicates.value / bindings.total) + ")";
			}).direction("e");
	var svg = d3.select("#" + config.rootId).append("svg").attr("width",
			width + margin.left + margin.right).attr("height",
			height + margin.top + margin.bottom).append("g").attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	svg.call(tip);
	color.domain([ "# unique triples", "# duplicate triples" ]);

	svg.append("g").attr("class", "x axis")
	.call(xAxis).style("text-anchor", "end").append("text")
	.attr("x", (width / 2) - 20).attr("y", -25).attr("dx", ".71em").style(
			"text-anchor", "middle").style("font-size", "14px").text(
			"Number of triples (log)");

	svg.append("g").attr("class", "y axis").call(yAxis)
	;

	var state = svg.selectAll(".state").data(dataValues).enter().append("g")
			.attr("class", "g").attr("transform", function(d) {
				return "translate(0," + +y(d.doc.value) + ")";
			});
	var handleBarClick = function(bindings) {
		window.open("http://lodlaundromat.org/resource/" + bindings.md5.value);
	};
	state.selectAll(".bar").data(function(d) {
		return d.counts;
	}).enter().append("rect").attr("class", "bar")
			.attr("height", y.rangeBand()).attr("x", function(d) {
				return x(+(d.x0));
			}).attr("width", function(d) {
				return x(d.x1) - x(d.x0);
			}).style("fill", function(d) {
				return color(d.name);
			}).on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.on('click', handleBarClick);
	
	
	var legend = svg.selectAll(".legend")
			.data(color.domain().slice().reverse()).enter().append("g").attr(
					"class", "legend").attr("transform", function(d, i) {
				return "translate(0," + (height - (i * 20)) + ")";
			});

	legend.append("rect").attr("x", width - 18).attr("width", 18).attr(
			"height", 18).style("fill", color);

	legend.append("text").attr("x", width - 24).attr("y", 9)
			.attr("dy", ".35em").style("text-anchor", "end").text(function(d) {
				return d;
			});

};
