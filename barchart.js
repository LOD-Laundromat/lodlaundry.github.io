var drawBarChart = function(config) {
	var data = config.data;
	var dataValues = $.map(data, function (value, key) { return value; });
	dataValues = $.grep(dataValues, function( a ) {
//		console.log(a);
		  return a.rdf && a.rdf.triples && a.rdf.triples > 0;
		});
	
	 dataValues.forEach(function(d) {
		 d.total = +(d.rdf.triples + d.rdf.duplicates);
		 var origObject = $.extend({}, d);
		    d.counts = [
		       {
		    	   name: "# uniq triples",
		    	   x0: +1,
		    	   x1: +d.rdf.triples
		       },
		       {
		    	   name: "# duplicate triples",
		    	   x0: +d.rdf.triples,
		    	   x1: +(d.rdf.triples + d.rdf.duplicates)
		       }
		    ];
		    
		    $.extend(d.counts[0], origObject);
		    $.extend(d.counts[1], origObject);
		  });
		  
		  dataValues.sort(function(a, b) { return b.total - a.total; });

	var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom;


var x = d3.scale.log()
.range([0, width])
.domain([1, d3.max(dataValues, function(val){
	return val.total;
})]);

var y = d3.scale.ordinal()
.rangeBands([0, height], .1)
.domain(dataValues.map(function(d) { return d.url; }));



var color = d3.scale.ordinal()
    .range([ "#ff8c00", "#98abc5"]);






var numberFormat = d3.format(".1s");
/**
 * we want to keep the ticks, but not all the labels (as they'll start to overlap).
 * Use this function instead
 */
function logFormat(d) {
  var x = Math.log(d) / Math.log(10) + 1e-6;
  return Math.abs(x - Math.floor(x)) < .5 ? numberFormat(d) : "";
}


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat("");
//    .ticks(10)
//    .tickFormat(d3.format(".1s"));
    
var xAxis = d3.svg.axis()
.scale(x)
.tickFormat(logFormat)
.orient("top");


var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(function(d) {
	
  return "<i>" + d.url + ":<br> <strong>total triples: </strong>" + formatThousands(d.total) + "<br><Strong>unique: </strong>" + formatThousands(d.rdf.triples) + " (" + formatPercentage(d.rdf.triples / d.total) + ")<br><Strong>duplicates: </strong>" + formatThousands(d.rdf.duplicates) + " (" + formatPercentage(d.rdf.duplicates / d.total) + ")";
})
.direction("e");
var svg = d3.select("#" + config.rootId).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



svg.call(tip);
  color.domain(["# uniq triples", "# duplicate triples"]);


  svg.append("g")
      .attr("class", "x axis")
//      .attr("transform", "translate(" + width + ",0)")
      .call(xAxis)
      .style("text-anchor", "end")
      .append("text")
//	      .attr("transform", "rotate(-90)")
      	  .attr("x", (width /2)-20)
	      .attr("y", -25)
	      .attr("dx", ".71em")
	      .style("text-anchor", "middle")
	      .style("font-size", "14px")
	      .text("Number of triples (log)");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
//    .append("text")
//      .attr("transform", "rotate(-90)")
//      .attr("y", 6)
//      .attr("dy", ".71em")
      ;

  var state = svg.selectAll(".state")
      .data(dataValues)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(0," +  + y(d.url) + ")"; });

//  console.log(y.rangeBand());
  state.selectAll(".bar")
      .data(function(d) { return d.counts; })
    .enter().append("rect")
    .attr("class", "bar")
      .attr("height", y.rangeBand())
      .attr("x", function(d) {
//    	  return 0;
    	  return x(+(d.x0)); 
      })
      .attr("width", function(d) {
    	  return x(d.x1) - x(d.x0); 
       })
      .style("fill", function(d) { return color(d.name); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  
  
  var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + (height - (i * 20)) + ")"; });

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



