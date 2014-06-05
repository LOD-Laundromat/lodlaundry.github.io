  
  //add tooltip to dom, which we'll use in this barchart
  var tooltip = $('<div id="tooltip" class="hidden"><p><span id="value">100</span> </p></div>');
  $("#barChartDatasets").append(tooltip);
  
  var formatSerialization = function(serialization) {
	if (serialization == "xml") return "XML";
	if (serialization == "ntriples") return "N-Triples";
	if (serialization == "rdfa") return "RDFa";
	if (serialization == "turtle") return "Turtle";
	if (serialization == "trig") return "TriG";
	return serialization;
  };
  
  
  
  
$.ajax({
	url: sparql.url,
	data: {query:sparql.queries.serializationsPerDoc,"default-graph-uri": sparql.mainGraph},
	success: function(data) {
		drawPieChart({
	    	rootId: "pieChartDatasetSerializations",
			totalUnit: "documents",
			totalLabel: "TOTAL",
			hideLabelsBelow: 0.02,
			data: data.results.bindings,
			isArray: true,
			sumBy: function(bindings) {
			  return formatSerialization(bindings.serializationFormat.value);
			},
			aggregate: function(bindings) {
				return bindings.count.value;
			},
		});
	},
	
	headers: {
		"Accept": "application/sparql-results+json,*/*;q=0.9"
	}
});
$.ajax({
	url: sparql.url,
	data: {query:sparql.queries.serializationsPerTriple,"default-graph-uri": sparql.mainGraph},
	success: function(data) {
		drawPieChart({
			rootId: "pieChartTripleSerializations",
			totalUnit: "triples",
			totalLabel: "TOTAL",
			hideLabelsBelow: 0.02,
			data: data.results.bindings,
			isArray: true,
			sumBy: function(bindings) {
				return formatSerialization(bindings.serializationFormat.value);
			},
			aggregate: function(bindings) {
				return bindings.count.value;
			},
		});
	},
	headers: {
		"Accept": "application/sparql-results+json,*/*;q=0.9"
	}
});
$.ajax({
	url: sparql.url,
	data: {query:sparql.queries.contentTypesPerDoc,"default-graph-uri": sparql.mainGraph},
	success: function(data) {
		drawPieChart({
			rootId: "pieChartContentTypes",
			dimensions: {
				width: 600
			},
			totalUnit: "documents",
			totalLabel: "TOTAL",
			hideLabelsBelow: 0.05,
			data: data.results.bindings,
			isArray: true,
			sumBy: function(bindings) {
				return formatSerialization(bindings.contentType.value);
			},
			aggregate: function(bindings){return bindings.count.value;},
		});
	},
	headers: {
		"Accept": "application/sparql-results+json,*/*;q=0.9"
	}
});
$.ajax({
	url: sparql.url,
	data: {query:sparql.queries.contentTypesVsSerializationFormats,"default-graph-uri": sparql.mainGraph},
	success: function(data) {
		drawPieChart({
			rootId: "pieChartContentTypesVsSer",
			dimensions: {
				width: 600
			},
			totalUnit: "documents",
			totalLabel: "TOTAL",
			hideLabelsBelow: 0.05,
			data: data.results.bindings,
			isArray: true,
			sumBy: function(bindings) {
				return bindings.matchType.value;
			},
			aggregate: function(bindings){return bindings.count.value;},
		});
	},
	headers: {
		"Accept": "application/sparql-results+json,*/*;q=0.9"
	}
});
$.ajax({
	url: sparql.url,
	data: {query:sparql.queries.parseExceptions,"default-graph-uri": sparql.mainGraph},
	success: function(data) {
		drawPieChart({
			rootId: "pieChartExceptions",
			dimensions: {
				width: 600
			},
			totalUnit: "documents",
			totalLabel: "TOTAL",
			hideLabelsBelow: 0.04,
			data: data.results.bindings,
			isArray: true,
			sumBy: function(bindings) {
				
				var hasTriples = bindings.triples && bindings.triples.value > 0;
				var hasException = bindings.exception && bindings.exception.value == 1;
				var hasSyntaxErrors = bindings.message && bindings.message.value == 1;
				
				var returnVal = null;
				if (hasException) {
					returnVal = "Exception";
				} else if (hasSyntaxErrors) {
					if (hasTriples) {
						returnVal = "Some syntax errors";
					} else {
						returnVal = "Only syntax errors";
					}
				} else {
					returnVal = "No errors";
				}
				return returnVal;
				
			},
			aggregate: function(bindings){return 1;},
		});
	},
	headers: {
		"Accept": "application/sparql-results+json,*/*;q=0.9"
	}
});
  
$.ajax({
	url: sparql.url,
	data: {query:sparql.queries.contentLengths,"default-graph-uri": sparql.mainGraph},
	success: function(data) {
		drawContentLengthBarChart({
			rootId: "barChartContentLength",
			data: data.results.bindings,
		});
	},
	headers: {
		"Accept": "application/sparql-results+json,*/*;q=0.9"
	}
});

$.ajax({
	url: sparql.url,
	data: {query:sparql.queries.datasetsWithCounts,"default-graph-uri": sparql.mainGraph},
	success: function(data) {
		drawDatasetsBarChart({
			rootId: "barChartDatasets",
			data: data.results.bindings,
		});
	},
	headers: {
		"Accept": "application/sparql-results+json,*/*;q=0.9"
	}
});





$("#getJsonAllBtn").attr("href", api.wardrobe.all);
	
	
