  drawBackButton();
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