

var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()

    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom").tickFormat("");//this hides the label. no space for complete uri per bar

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
   // .tickFormat(formatPercent);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Dataset:</strong> <span style='color:red'>" + d["base_iri"] + "</span>";
  });

var svg = d3.select("#barchart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

d3.json(api.wardrobe.all, function(error, data) {
	console.log(dataValues);
//d3.tsv("data.tsv", type, function(error, data) {
	var dataValues = $.map(data, function (value, key) { return value; });
	dataValues = $.grep(dataValues, function( a ) {
		console.log(a);
		  return a.triples && a.triples > 0;
		});
	dataValues.sort(function(a, b){
	  return ((a.triples > b.triples) ? -1 : ((a.triples < b.triples) ? 1 : 0));
	});
//	console.log(data);
  x.domain(dataValues.map(function(d) { return d.url; }));
  y.domain([0, d3.max(dataValues, function(d) { return d.triples; })]);

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
      .text("Frequency");
  svg.selectAll(".bar")
      .data(dataValues)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.url); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.triples); })
      .attr("height", function(d) { return height - y(d.triples); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

});

function type(d) {
  d.triples = +d.triples;
  return d;
}

