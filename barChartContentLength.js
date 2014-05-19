var drawContentLengthBarChart = function(config) {
	var data = config.data;
	var dataValues = $.map(data, function(value, key) {
		return value;
	});
	dataValues = $.grep(dataValues, function(a) {
		var hasResponse = a.httpResponse;
		var hasContentLength = hasResponse && a.httpResponse.contentLength >= 0;
		var hasByteCount = a.stream && a.stream.byteCount >= 0;
		var isZip = a.hasArchiveEntry || a.fromArchive;//no zipped files! the bytecount is the -rdf- byte count, not the zip byte count
		return !isZip && hasContentLength && hasByteCount;
	});

	var formatOrdinalVal = d3.format(".2s");
	var getBucket = function(diff, largerThan, lessThan) {
		if (!largerThan) largerThan = 1;
		if (!lessThan) lessThan = 1000;
		if (diff >= largerThan && diff <= lessThan) {
//			return largerThan + "-" + lessThan;
			return  "< " + formatOrdinalVal(lessThan);
		} else {
			return getBucket(diff, lessThan, lessThan * 10);
		}
	};
	var totalDatasets = 0;
	dataValues.forEach(function(d) {
		totalDatasets++;
		d.diff = Math.abs(d.httpResponse.contentLength - d.stream.byteCount);
		if (d.diff == 0) {
			d.diffOrdinal = "0";
		} else {
			d.diffOrdinal = getBucket(d.diff);
		}
	});

	dataValues.sort(function(a, b) {
		return a.diff - b.diff;
	});

	var nestedData = d3.nest()
	.key(function(d) { return d.diffOrdinal; })
	.rollup(function(leaves) { return leaves.length; })
	.entries(dataValues);
	
	for (var i = 0; i < nestedData.length; i++) {
		nestedData[i].relVal = nestedData[i].values / totalDatasets;
	}
	var margin = {top: 20, right: 20, bottom: 90, left:60},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

	var formatPercent = d3.format("%");
	var formatPercentDetailed = d3.format(".2%");
	var x = d3.scale.ordinal()
	    .rangeRoundBands([0, width], .1);
	
	var y = d3.scale.linear()
	    .range([height, 0]);
	
	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");
	
	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left")
	    .tickFormat(formatPercent);
	
	var tip = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
	    return "#documents: " + d.values + " (" + formatPercentDetailed(d.relVal) + ")";
	  });
	
	var svg = d3.select("#" + config.rootId).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	svg.call(tip);
	
	  x.domain(nestedData.map(function(d) { return d.key; }));
	  y.domain([0, d3.max(nestedData, function(d) { return d.relVal; })]);
	
  var xAxisSvg = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");
      
  xAxisSvg.call(xAxis)
	  .selectAll("text")  
	  .style("text-anchor", "end")
	  .attr("dx", "-.8em")
	  .attr("dy", ".15em")
	  .attr("transform", function(d) {
	      return "rotate(-65)" ;
	      });
  svg.append("text")      // text label for the x axis
  .attr("x", width/2  )
  .attr("y",  height + 60 )
  .style("text-anchor", "middle")
  .html("&Delta; content length (in bytes)");
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "translate(-50,0) rotate(-90) ")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("% datasets");

  
  
  
  
  svg.selectAll(".bar")
      .data(nestedData)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { 
    	  return x(d.key); 
    	  
    	  })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { 
    	  return y(d.relVal);
    	  })
      .attr("height", function(d) { return height - y(d.relVal); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
	
	
	function type(d) {
	  d.frequency = +d.frequency;
	  return d;
	}
};
