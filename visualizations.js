  drawBackButton();
  
  
  //add tooltip to dom, which we'll use in this barchart
  var tooltip = $('<div id="tooltip" class="hidden"><p><span id="value">100</span> </p></div>');
  $("#barChartDatasets").append(tooltip);
  
  
  
	$.get(api.wardrobe.all, function(data) {
		  drawPieChart({
		    	rootId: "pieChartTripleSerializations",
	    	sumBy: function(d) {
				  return d.rdf.serializationFormat;
				},
	    	aggregate: function(d) {
				  return d.rdf.triples;
			},
	    	totalUnit: "triples",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.05,
	    	data: data.results
	    });
	    drawPieChart({
	    	rootId: "pieChartDatasetSerializations",
	    	sumBy: function(d) {
				  return d.rdf.serializationFormat;
			},
	    	aggregate: function(){return 1;},
	    	totalUnit: "datasets",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.05,
	    	data:data.results
	    });
	    drawBarChart({
	    	rootId: "barChartDatasets",
	    	data:data.results
	    });
	    
	    
});

$("#getJsonAllBtn").attr("href", api.wardrobe.all);
	
	
  
    
