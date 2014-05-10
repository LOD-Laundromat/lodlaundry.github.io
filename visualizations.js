  drawBackButton();
  
  
  //add tooltip to dom, which we'll use in this barchart
  var tooltip = $('<div id="tooltip" class="hidden"><p><span id="value">100</span> </p></div>');
  $("#barChartDatasets").append(tooltip);
  
  
  
	$.get(api.wardrobe.all, function(data) {
		  drawPieChart({
		    	rootId: "pieChartTripleSerializations",
	    	sumBy: "content_type",
	    	aggregate: "triples",
	    	totalUnit: "triples",
	    	totalLabel: "TOTAL",
	    	data: data
	    });
	    drawPieChart({
	    	rootId: "pieChartDatasetSerializations",
	    	sumBy: "content_type",
	    	aggregate: function(){return 1;},
	    	totalUnit: "datasets",
	    	totalLabel: "TOTAL",
	    	data:data
	    });
	    drawBarChart({
	    	rootId: "barChartDatasets",
	    	data:data
	    });
	    
	    
});

$("#getJsonAllBtn").attr("href", api.wardrobe.all);
	
	
  
    
