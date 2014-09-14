
function drawDegreeBarChart(config) {
	config.data = d3.tsv.parse(config.data);
	var dimensions = {
			width: 900,
			height: 300,
			margins: {top: 20, right: 20, bottom: 30, left: 40}
	};
	if (config.dimensions) $.extend(dimensions,config.dimensions);
	
	var sortDegrees = function (a, b) {
        if (b.current > a.current) return 1;
        if (b.current < a.current) return -1;
        return 0;
    };
	
	config.data.forEach(function(d){
		d.current = d.degreeMean;
	});
	
	var handleBarClick = function(d) {
		window.open(d.doc.replace("/metrics", ""));
	};
	var tip = d3.tip().attr('class', 'd3-tip')//.offset([ -10, 0 ])
	.html(
		function(d) {
			var getHtmlForCat = function(cat) {
				var catHtml = "<strong>" + cat.charAt(0).toUpperCase() + cat.slice(1) + "</strong><ul>";
				catHtml += "<li><i>Mean</i>: " + parseFloat(d[cat+"Mean"]).toFixed(2) + "</li>";
				catHtml += "<li><i>Standard Deviation</i>: " + parseFloat(d[cat+"Std"]).toFixed(2) + "</li>";
				catHtml += "<li><i>Median</i>: " + d[cat+"Median"] + "</li>";
				catHtml += "<li><i>Range</i>: " + d[cat+"Range"] + "</li>";
				catHtml += "</ul>";
				return catHtml;
			};
			
			
			return getHtmlForCat("degree") + getHtmlForCat("inDegree") + getHtmlForCat("outDegree") ;
			
		}).direction("n");
	
	
	var svg = d3.select("#" + config.rootId).append("svg")
    .attr("width", dimensions.width + dimensions.margins.left + dimensions.margins.right)
	    .attr("height", dimensions.height + dimensions.margins.top + dimensions.margins.bottom)
	  .append("g")
	    .attr("transform", "translate(" + dimensions.margins.left + "," + dimensions.margins.top + ")");
	
	
	
	svg.call(tip);
	
	var x = d3.scale.ordinal()
    .rangeRoundBands([0, dimensions.width], .1);
	var y = d3.scale.linear()
	    .range([dimensions.height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .tickFormat(function(){return "";})
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");
	
	x.domain(config.data.map(function(d) { 
		  return d.doc; 
		  }));
	  y.domain([0, d3.max(config.data, function(d) { 
		  return +d.current; 
		  })]);
	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + dimensions.height + ")")
      .call(xAxis);
	 svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Datasets");
	var update = function() {
		var type = degreeSelect.val() + statSelect.val();
		var transitionDuration = 300;
		var delay = function(d, i) { return i * 20; };
		config.data.forEach(function(d){
			d.current = d[type];
		});
//		d3.scale.log().domain([1, 100]).range([dim-padding,padding]);
		var x0 = x.domain(config.data.sort(function(a, b) { return b.current - a.current; })
					.map(function(d) { return d.doc; }))
				.copy();
		var maxY = d3.max(config.data, function(d) { 
			  return +d.current;
		  });
		var y0;
//		
		if (maxY < 1000) {
			y0 = d3.scale.linear().range([dimensions.height, 0]).domain([0, maxY]).copy();
		} else {
			y0 = d3.scale.log().range([dimensions.height, 0]).domain([1, maxY]);
		}
			

		var bars = svg.selectAll(".bar")
		      .data(config.data);
		  
		  bars.enter().append("rect")
	      .attr("class", "bar")
	      .on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.on('click', handleBarClick);
		  bars
		  .sort(sortDegrees)
		    .transition()
		    .duration(transitionDuration)
		    .delay(delay)
		      .attr("x", function(d) { 
		    	  return x(d.doc); 
		    	  })
		      .attr("width", x.rangeBand())
		      .attr("y", function(d) {
		    	  return y0(+d.current);
		    	  })
		      .attr("height", function(d) { return dimensions.height - y0(+d.current); });
		  
		  
//		  var transition = svg.transition().duration(750),
//	        delay = function(d, i) { return i * 5; };
//
//		    transition.selectAll(".bar")
//		        .delay(delay)
//		        .attr("x", function(d) { return x0(d.current); });
//	console.log("sd");
		  
		  var transition = svg.transition().duration(transitionDuration)
		    .select(".y.axis")
		        .call(yAxis.scale(y0))
		      .selectAll("g")
		        .delay(delay);
//		  };
		  
		  
		  
//		  bars.exit()
//		    .transition()
//		    .duration(300)
//		    .ease("exp")
//		        .attr("width", 0)
//		        .remove();
		    
		    
		    
//		  console.log( svg.selectAll("rect"));
//		  svg.selectAll("rect")
//	        .sort(sortDegrees)
//	        .transition()
//	        .delay(function (d, i) {
//	        return i * 50;
//	    })
//	        .duration(1000)
//	        .attr("x", function (d, i) {
//	        return x(d.doc);
//	    });
		  
	};
	var selectDiv = $("<div/>").appendTo($("#" + config.rootId));
	var degreeSelect = $("<select id='degree'></select>")
	.on("change", update).appendTo(selectDiv);
	$("<option value='degree' selected='selected'>Degree</option>").appendTo(degreeSelect);
	$("<option value='inDegree' >In Degree</option>").appendTo(degreeSelect);
	$("<option value='outDegree' >Out Degree</option>").appendTo(degreeSelect);
	var statSelect = $("<select id='stat'></select>")
		.on("change", update).appendTo(selectDiv);
	$("<option value='Mean' selected='selected'>Mean</option>").appendTo(statSelect);
	$("<option value='Std' >Standard Deviation</option>").appendTo(statSelect);
	$("<option value='Median' >Median</option>").appendTo(statSelect);
	$("<option value='Range'>Range</option>").appendTo(statSelect);
	update();
	function type(d) {
	  d.current = +d.current;
	  return d;
	}
};