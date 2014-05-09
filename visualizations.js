  drawBackButton();
  
  
  //add tooltip to dom, which we'll use in this barchart
  var tooltip = $('<div id="tooltip" class="hidden"><p><span id="value">100</span> </p></div>');
  $("#barChartDatasets").append(tooltip);
  
  
    drawPieChart({
    	rootId: "pieChartTripleSerializations",
    	sumBy: "content_type",
    	aggregate: "triples",
    	totalUnit: "triples",
    	totalLabel: "TOTAL"
    });
    drawPieChart({
    	rootId: "pieChartDatasetSerializations",
    	sumBy: "content_type",
    	aggregate: function(){return 1;},
    	totalUnit: "datasets",
    	totalLabel: "TOTAL"
    });
    drawBarChart({
    	rootId: "barChartDatasets",
    });
    
