  drawBackButton();
  
  //add tooltip to dom, which we'll use in this barchart
  var tooltip = $('<div id="tooltip" class="hidden"><p><span id="value">100</span> </p></div>');
  $("#barChartDatasets").append(tooltip);
  
  var formatSerialization = function(serialization) {
	if (serialization == "xml") return "XML";
	if (serialization == "ntriples") return "N-Triples";
	if (serialization == "rdfa") return "RDFa";
	if (serialization == "turtle") return "Turtle";
	if (serialization == "trig") return "TriG";
	return serialization
  };
  
	$.get(api.wardrobe.all, function(data) {
		  drawPieChart({
		    	rootId: "pieChartTripleSerializations",
	    	sumBy: function(d) {
				  return formatSerialization(d.rdf.serializationFormat);
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
				  return formatSerialization(d.rdf.serializationFormat);
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
	    		var semiColonIndex = d.httpresponse.contentType.indexOf(';');
	    		var formattedContentType = d.httpresponse.contentType;
	    		if (semiColonIndex > 0) formattedContentType = formattedContentType.substring(0, semiColonIndex);
//	    		if (formattedContentType == "application/x-bzip2") console.log(d);
	    		return formattedContentType;
	    	},
	    	aggregate: function(){return 1;},
	    	filter: function(d) {
	    		if (d.hasArchiveEntry) return false;
	    		if (d.fromArchive) return false;
	    		return d.httpresponse && d.httpresponse.contentType;
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
	    		if (d.httpresponse.contentType.indexOf(d.rdf.serializationFormat) > -1) return "matches";
	    		return "does not match";
	    	},
	    	clickSlice: function(d) {
	    		
	    	},
	    	aggregate: function(){return 1;},
	    	filter: function(d) {
	    		if (d.hasArchiveEntry) return false;
	    		if (d.fromArchive) return false;
	    		if (!d.httpresponse) return false;
	    		if (!d.httpresponse.contentType) return false;
	    		if (d.httpresponse.contentType.indexOf("zip") > -1) return false;
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
				  if (hasTriples && !syntaxError) return "No errors";
				  if (hasTriples && syntaxError) return "Some syntax errors";
//				  if (!syntaxError && !hasTriples) console.log("no error, not triples. he??", d);
				  return "Only syntax errors";
			},
	    	aggregate: function(){return 1;},
	    	totalUnit: "documents",
	    	totalLabel: "TOTAL",
	    	hideLabelsBelow: 0.04,
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
	
	
