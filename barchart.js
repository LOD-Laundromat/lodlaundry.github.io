var drawBarChartWithData = function(config, data) {
	var dataValues = $.map(data, function (value, key) { return value; });
	dataValues = $.grep(dataValues, function( a ) {
//		console.log(a);
		  return a.triples && a.triples > 0;
		});

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .range([ "#ff8c00", "#98abc5"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat("")
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));
var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(function(d) {
  return "<i>" + d.base_iri + " (<span style='color:red'>" + d.total + " </span>";
});

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
svg.call(tip);
  color.domain(["# uniq triples", "# duplicate triples"]);


  dataValues.forEach(function(d) {
    d.counts = [
       {
    	   name: "# uniq triples",
    	   y0: 0,
    	   y1: d.triples
       },
       {
    	   name: "# duplicate triples",
    	   y0: d.triples,
    	   y1: d.triples + d.duplicates
       }
    ];
    d.total = d.triples + d.duplicates;
    $.extend(d.counts[0], d);
    $.extend(d.counts[1], d);
  });
  
  dataValues.sort(function(a, b) { return b.total - a.total; });

  x.domain(dataValues.map(function(d) { return d.base_iri; }));
  y.domain([0, d3.max(dataValues, function(d) { return d.total; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("#triples");

  var state = svg.selectAll(".state")
      .data(dataValues)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.base_iri) + ",0)"; });

  
  state.selectAll(".bar")
      .data(function(d) { return d.counts; })
    .enter().append("rect")
    .attr("class", "bar")
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .style("fill", function(d) { return color(d.name); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  
  
  var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

 
	
};



var drawBarChart = function(config) {
	$.get(api.wardrobe.all, function(data) {
		drawBarChartWithData(config, data);
	});
	
};

