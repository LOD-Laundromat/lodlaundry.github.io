var drawPieChart = function(config) {
	var w = 450;
	var h = 300;
	var r = 100;
	var ir = 45;
	var textOffset = 14;
	var tweenDuration = 250;
	var data = config.data;
	var pieChartPercentage = d3.format(".1%");
    var getAngle = function (d) {
        return (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
    };
	//OBJECTS TO BE POPULATED WITH DATA LATER
	var lines, valueLabels, nameLabels;
	var pieData = [];    
	var oldPieData = null;
	var filteredPieData = null;
	
	//D3 helper function to populate pie slice parameters from array data
	var donut = d3.layout.pie().value(function(d){
	  return d.values;
	});
	
	//D3 helper function to create colors from an ordinal scale
	var color = d3.scale.category20();
	
	//D3 helper function to draw arcs, populates parameter "d" in path object
	var arc = d3.svg.arc()
	  .startAngle(function(d){ return d.startAngle; })
	  .endAngle(function(d){ return d.endAngle; })
	  .innerRadius(ir)
	  .outerRadius(r);
	
	///////////////////////////////////////////////////////////
	// GENERATE FAKE DATA /////////////////////////////////////
	///////////////////////////////////////////////////////////
	
	var arrayRange = 100000; //range of potential values for each item
	var arraySize;
	var streakerDataAdded;
	
	
	///////////////////////////////////////////////////////////
	// CREATE VIS & GROUPS ////////////////////////////////////
	///////////////////////////////////////////////////////////
	
	var vis = d3.select("#" + config.rootId).append("svg:svg")
	  .attr("width", w)
	  .attr("height", h);
	
	//GROUP FOR ARCS/PATHS
	var arc_group = vis.append("svg:g")
	  .attr("class", "arc")
	  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");
	
	//GROUP FOR LABELS
	var label_group = vis.append("svg:g")
	  .attr("class", "label_group")
	  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");
	
	//GROUP FOR CENTER TEXT  
	var center_group = vis.append("svg:g")
	  .attr("class", "center_group")
	  .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");
	
	//PLACEHOLDER GRAY CIRCLE
	var paths = arc_group.append("svg:circle")
	    .attr("fill", "#EFEFEF")
	    .attr("r", r);
	
	///////////////////////////////////////////////////////////
	// CENTER TEXT ////////////////////////////////////////////
	///////////////////////////////////////////////////////////
	
	//WHITE CIRCLE BEHIND LABELS
	var whiteCircle = center_group.append("svg:circle")
	  .attr("fill", "white")
	  .attr("r", ir);
	
	// "TOTAL" LABEL
	var totalLabel = center_group.append("svg:text")
	  .attr("class", "label")
	  .attr("dy", -15)
	  .attr("text-anchor", "middle") // text-align: right
	  .text(config.totalLabel);
	
	//TOTAL TRAFFIC VALUE
	var totalValue = center_group.append("svg:text")
	  .attr("class", "total")
	  .attr("dy", 7)
	  .attr("text-anchor", "middle") // text-align: right
	  .text("Waiting...");
	
	//UNITS LABEL
	var totalUnits = center_group.append("svg:text")
	  .attr("class", "units")
	  .attr("dy", 21)
	  .attr("text-anchor", "middle") // text-align: right
	  .text(config.totalUnit);
	
	
	
		var dataValues = $.map(data, function (value, key) { return value; });
		dataValues = $.grep(dataValues, function( a ) {
			  return a.rdf && a.rdf.triples > 0;
			});
//		var sum_by = config.sumBy;
		var aggregatedValues = d3.nest().key(
//				function(d) {
//			  return d[sum_by];
//			}
				config.sumBy
			)
			.rollup(function(d) {
			  return d3.sum(d, config.aggregate);
			}).entries(dataValues);
		
		
		
	//  arraySize = Math.ceil(Math.random()*10);
	  streakerDataAdded = d3.range(aggregatedValues.length).map(function(index) {
		  return aggregatedValues[index];
		}
	);
	
	  oldPieData = filteredPieData;
	  pieData = donut(streakerDataAdded);
	  var totalTriples = 0;
	  filteredPieData = pieData.filter(filterData);
	  function filterData(element, index, array) {
	    element.name = streakerDataAdded[index].key;
	    element.value = streakerDataAdded[index].values;
	    totalTriples += element.value;
	    return (element.value > 0);
	  }
	  
	  
	  if (oldPieData == null) {
		  oldPieData = filteredPieData;
		  $.each(oldPieData, function(d) { d.endAngle = 0; d.startAngle=0;});
	  }
	  if(filteredPieData.length > 0 &&  oldPieData.length > 0){
	
	    //REMOVE PLACEHOLDER CIRCLE
	    arc_group.selectAll("circle").remove();
	    totalValue.text(formatLargeShortForm(totalTriples));
//	    totalValue.text(function(){
//	      var kb = totalTriples/1024;
//	      return kb.toFixed(1);
//	    });
	
	    //DRAW ARC PATHS
	    paths = arc_group.selectAll("path").data(filteredPieData);
	    paths.enter().append("svg:path")
	      .attr("stroke", "white")
	      .attr("stroke-width", 0.5)
	      .attr("fill", function(d, i) { return color(i); })
	      .transition()
	        .duration(tweenDuration)
	        .attrTween("d", pieTween);
	    paths
	      .transition()
	        .duration(tweenDuration)
	        .attrTween("d", pieTween);
	    paths.exit()
	      .transition()
	        .duration(tweenDuration)
	        .attrTween("d", removePieTween)
	      .remove();
	
	    //DRAW TICK MARK LINES FOR LABELS
	    lines = label_group.selectAll("line").data(filteredPieData);
	    lines.enter().append("svg:line")
	      .attr("x1", 0)
	      .attr("x2", 0)
	      .attr("y1", -r-3)
	      .attr("y2", -r-8)
	      .attr("stroke", "gray")
	      .attr("transform", function(d) {
	        return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
	      });
	    lines.transition()
	      .duration(tweenDuration)
	      .attr("transform", function(d) {
	        return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
	      });
	    lines.exit().remove();
	
	
	    //DRAW LABELS WITH ENTITY NAMES
	    nameLabels = label_group.selectAll("text.units").data(filteredPieData)
	      .attr("dy", function(d){
	        if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
	          return 17;
	        } else {
	          return 5;
	        }
	      })
	      .attr("text-anchor", function(d){
	        if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
	          return "beginning";
	        } else {
	          return "end";
	        }
	      }).text(function(d){
	        return d.name;
	      });
	
	    nameLabels.enter().append("svg:text")
	      .attr("class", "units")
	      .attr("text-anchor", function(d){
	        if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
	          return "beginning";
	        } else {
	          return "end";
	        }
	      }).text(function(d){
	    	  if ((d.value/totalTriples) > config.hideLabelsBelow) {
	    		  return d.name + " (" + pieChartPercentage((d.value/totalTriples)) + ")";
	    	  } else {
	    		  return "";
	    	  }
	        
	      });
	
	    nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);
	
	    nameLabels.exit().remove();
	  }  
	
	///////////////////////////////////////////////////////////
	// FUNCTIONS //////////////////////////////////////////////
	///////////////////////////////////////////////////////////
	
	// Interpolate the arcs in data space.
	function pieTween(d, i) {
	  var s0;
	  var e0;
	  if(oldPieData[i]){
	    s0 = oldPieData[i].startAngle;
	    e0 = oldPieData[i].endAngle;
	  } else if (!(oldPieData[i]) && oldPieData[i-1]) {
	    s0 = oldPieData[i-1].endAngle;
	    e0 = oldPieData[i-1].endAngle;
	  } else if(!(oldPieData[i-1]) && oldPieData.length > 0){
	    s0 = oldPieData[oldPieData.length-1].endAngle;
	    e0 = oldPieData[oldPieData.length-1].endAngle;
	  } else {
	    s0 = 0;
	    e0 = 0;
	  }
	  var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
	  return function(t) {
	    var b = i(t);
	    return arc(b);
	  };
	}
	
	function removePieTween(d, i) {
	  s0 = 2 * Math.PI;
	  e0 = 2 * Math.PI;
	  var i = d3.interpolate({startAngle: d.startAngle, endAngle: d.endAngle}, {startAngle: s0, endAngle: e0});
	  return function(t) {
	    var b = i(t);
	    return arc(b);
	  };
	}
	
	function textTween(d, i) {
	  var a;
	  if(oldPieData[i]){
	    a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI)/2;
	  } else if (!(oldPieData[i]) && oldPieData[i-1]) {
	    a = (oldPieData[i-1].startAngle + oldPieData[i-1].endAngle - Math.PI)/2;
	  } else if(!(oldPieData[i-1]) && oldPieData.length > 0) {
	    a = (oldPieData[oldPieData.length-1].startAngle + oldPieData[oldPieData.length-1].endAngle - Math.PI)/2;
	  } else {
	    a = 0;
	  }
	  var b = (d.startAngle + d.endAngle - Math.PI)/2;
	
	  var fn = d3.interpolateNumber(a, b);
	  return function(t) {
	    var val = fn(t);
	    return "translate(" + Math.cos(val) * (r+textOffset) + "," + Math.sin(val) * (r+textOffset) + ")";
	  };
	}
	
};