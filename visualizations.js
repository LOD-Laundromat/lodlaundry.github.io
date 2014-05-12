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
	    	hideLabelsBelow: 0.02,
	    	data: $.extend({}, data.results)
	    });
	    drawPieChart({
	    	rootId: "pieChartDatasetSerializations",
	    	sumBy: function(d) {
				  return d.rdf.serializationFormat;
			},
	    	aggregate: function(){return 1;},
			filter: function(d) {
				return d.rdf && d.rdf.serializationFormat;
			},
	    	totalUnit: "documents",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.02,
	    	data: $.extend({}, data.results)
	    });
	    drawPieChart({
	    	rootId: "pieChartContentTypes",
	    	dimensions: {
	    		width: 600
	    	},
	    	sumBy: function(d) {
	    		var semiColonIndex = d.httpRepsonse.contentType.indexOf(';');
	    		var formattedContentType = d.httpRepsonse.contentType;
	    		if (semiColonIndex > 0) formattedContentType = formattedContentType.substring(0, semiColonIndex);
//	    		if (formattedContentType == "application/x-bzip2") console.log(d);
	    		return formattedContentType;
	    	},
	    	aggregate: function(){return 1;},
	    	filter: function(d) {
	    		if (d.hasArchiveEntry) return false;
	    		if (d.fromArchive) return false;
	    		return d.httpRepsonse && d.httpRepsonse.contentType;
	    	},
	    	totalUnit: "documents",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.05,
	    	data: $.extend({}, data.results)
	    });
	    drawPieChart({
	    	rootId: "pieChartContentTypesVsSer",
	    	dimensions: {
	    		width: 600
	    	},
	    	sumBy: function(d) {
	    		if (d.httpRepsonse.contentType.indexOf(d.rdf.serializationFormat) > -1) return "matches";
	    		return "does not match";
	    	},
	    	aggregate: function(){return 1;},
	    	filter: function(d) {
	    		if (d.hasArchiveEntry) return false;
	    		if (d.fromArchive) return false;
	    		if (!d.httpRepsonse) return false;
	    		if (!d.httpRepsonse.contentType) return false;
	    		if (d.httpRepsonse.contentType.indexOf("zip") > -1) return false;
	    		return d.rdf && d.rdf.serializationFormat;
	    	},
	    	totalUnit: "documents",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.05,
	    	data: $.extend({}, data.results)
	    });
	    drawPieChart({
	    	rootId: "pieChartExceptions",
	    	dimensions: {
	    		width: 600
	    	},
	    	sumBy: function(d) {
	    		
	    		var exceptionConcat = "";
				  for (var exception in d.exceptions) {
					  if (!exceptionConcat) {
						  exceptionConcat = exception; 
					  } else {
						  exceptionConcat += "/" + exception;
					  }
				  }
				  if (exceptionConcat.length > 0) {
					  return exceptionConcat.charAt(0).toUpperCase() + exceptionConcat.slice(1) + " Exception";
				  }
				  var syntaxError = d.rdf && d.rdf.syntaxErrors && d.rdf.syntaxErrors.length;
				  var hasTriples = d.rdf && d.rdf.triples > 0;
				  if (hasTriples && !syntaxError) return "Valid";
				  if (hasTriples && syntaxError) return "Triples, but with syntax errors";
//				  if (!syntaxError && !hasTriples) console.log("no error, not triples. he??", d);
				  return "No Triples, syntax errors";
			},
	    	aggregate: function(){return 1;},
	    	totalUnit: "documents",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.03,
	    	filter: function(d) {
				return !d.hasArchiveEntry;
			},
	    	data: $.extend({}, data.results)
	    });
	    drawBarChart({
	    	rootId: "barChartDatasets",
	    	data: $.extend({}, data.results)
	    });
	    drawContentLengthBarChart({
	    	rootId: "barChartContentLength",
	    	data: $.extend({}, data.results)
	    });
	    
	    goToHash();
});

$("#getJsonAllBtn").attr("href", api.wardrobe.all);
	
	
