
function drawDegreeBarChart(config) {
    
	var dimensions = {
			width: 1100,
			height: 300,
			margins: {top: 20, right: 20, bottom: 30, left: 40}
	};
	var getWidth = function(data) {
	    return Math.max(dimensions.width, (data.length + 200));
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
				catHtml += "<li><i>Min</i>: " + d[cat+"Min"] + "</li>";
				catHtml += "<li><i>Max</i>: " + d[cat+"Max"] + "</li>";
				catHtml += "</ul>";
				return catHtml;
			};
			
			
			return getHtmlForCat("degree") + getHtmlForCat("inDegree") + getHtmlForCat("outDegree") ;
			
		}).direction("n");
	
	var x, y, yAxisText;
	var updateWidth = function(data) {
	    var width = getWidth(data);
	    svg.attr("width", width + dimensions.margins.left + dimensions.margins.right);
	    
	    
	    x = d3.scale.ordinal()
	    .rangeRoundBands([10, getWidth(data)], .1);
	    y = d3.scale.linear()
        .range([dimensions.height, 0]);
	    yAxis.scale(y);
	    x.domain(config.data.map(function(d) { 
	          return d.doc; 
	          }));
	    y.domain([0, d3.max(config.data, function(d) { 
	          return +d.current; 
	          })]);
	    xAxis.scale(x);
	    svg.select(".x").remove();
	    svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + dimensions.height + ")")
	      .call(xAxis);
	    
	    svg.select(".y").remove();
	    var yAxisSvg = svg.append("g")
	      .attr("class", "y axis")
	      .attr("transform", "translate(" + dimensions.margins.left + ",0)")
	      .call(yAxis);
	    yAxisText = yAxisSvg.append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Datasets");
	    
	    
	};
	var svg = d3.select("#" + config.rootId).append("svg")
//    .attr("width", getWidth(config.data) + dimensions.margins.left + dimensions.margins.right)
	    .attr("height", dimensions.height + dimensions.margins.top + dimensions.margins.bottom);
	    
	
	  svg.append("g")
	    .attr("transform", "translate(" + dimensions.margins.left + "," + dimensions.margins.top + ")");
//	updateWidth(config.data);
	
	
	svg.call(tip);
	
//	var x = d3.scale.ordinal()
//    .rangeRoundBands([0, getWidth(config.data)], .1);


	var xAxis = d3.svg.axis()
//	    .scale(x)
	    .tickFormat(function(){return "";})
	    .orient("bottom");

	var yAxis = d3.svg.axis()
//	    .scale(y)
	    .orient("left");
	
	
	  

	
	var update = function() {
		var type = degreeSelect.val() + statSelect.val();
		var limit = limitSelect.val();
		
		var transitionDuration = 300;
		var delay = function(d, i) { return i * 20; };
		config.data.forEach(function(d){
			d.current = d[type];
		});
		config.data.sort(function(a, b) { return b.current - a.current; });
		var limittedData = (limit == "all"? config.data: config.data.slice(0, limit));
		updateWidth(limittedData);
		yAxisText.text(degreeSelect.val().charAt(0).toUpperCase() + degreeSelect.val().slice(1) + " - " + statSelect.val());
//		d3.scale.log().domain([1, 100]).range([dim-padding,padding]);
		var x0 = x.domain(limittedData.map(function(d) { return d.doc; }))
				.copy();
		var maxY = d3.max(limittedData, function(d) { 
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
		      .data(limittedData);
		  
		  bars.enter().append("rect")
	      .attr("class", "bar")
	      .on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.on('click', handleBarClick);
		  bars
		  .sort(sortDegrees)
		      .attr("x", function(d) { 
		    	  return x(d.doc); 
		    	  })
		      .attr("width", x.rangeBand([0, getWidth(limittedData) - dimensions.margins.left - dimensions.margins.right - 50]))
		      .attr("y", function(d) {
		    	  return y0(+d.current);
		    	  })
		      .attr("height", function(d) { return dimensions.height - y0(+d.current); });
		  
		  
		  var transition = svg.transition().duration(transitionDuration)
		    .select(".y.axis")
		        .call(yAxis.scale(y0))
		      .selectAll("g")
		        .delay(delay);
		  
		  
		  
		  
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
	$("<option value='Min'>Min</option>").appendTo(statSelect);
	$("<option value='Max'>Max</option>").appendTo(statSelect);
	var limitSelect = $("<select id='limit'></select>")
    .on("change", update).appendTo(selectDiv);
    $("<option value='100' selected='selected'>Show top 100 datasets</option>").appendTo(limitSelect);
    $("<option value='1000' >Show top 1.000 datasets</option>").appendTo(limitSelect);
    $("<option value='10000' >Show top 10.000 datasets</option>").appendTo(limitSelect);
    $("<option value='all'>Show all datasets</option>").appendTo(limitSelect);
	update();
	function type(d) {
	  d.current = +d.current;
	  return d;
	}
};