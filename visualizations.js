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
			filter: function(d) {
				return d.rdf && d.rdf.triples > 0;
			},
	    	totalUnit: "triples",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.05,
	    	data: $.extend({}, data.results)
	    });
	    drawPieChart({
	    	rootId: "pieChartDatasetSerializations",
	    	sumBy: function(d) {
				  return d.rdf.serializationFormat;
			},
	    	aggregate: function(){return 1;},
			filter: function(d) {
				return d.rdf && d.rdf.triples > 0;
			},
	    	totalUnit: "datasets",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.05,
	    	data: $.extend({}, data.results)
	    });
	    drawPieChart({
	    	rootId: "pieChartExceptions",
	    	sumBy: function(d) {
	    		var exceptionConcat;
				  for (var exception in d.exceptions) {
					  if (!exceptionConcat) {
						  exceptionConcat = exception; 
					  } else {
						  exceptionConcat += "/" + exception;
					  }
				  }
				  if (exceptionConcat) return exceptionConcat;
				  var syntaxError = d.rdf && d.rdf.syntaxErrors && d.rdf.syntaxErrors.length;
				  var hasTriples = d.rdf && d.rdf.triples > 0;
				  if (hasTriples && !syntaxError) return "valid";
				  if (hasTriples && syntaxError) return "has triples (with syntax errors)";
				  if (!syntaxError && !hasTriples) console.log("no error, not triples. he??", d);
				  return "syntax";
			},
	    	aggregate: function(){return 1;},
	    	totalUnit: "datasets",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.05,
	    	data: $.extend({}, data.results)
	    });
	    drawBarChart({
	    	rootId: "barChartDatasets",
	    	data: $.extend({}, data.results)
	    });
});

$("#getJsonAllBtn").attr("href", api.wardrobe.all);
	
	
