  
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
  

var fetchAndDrawViz = function(query, rootId, callback) {
	$.ajax({
		url: sparql.url,
		data: {query:query,"default-graph-uri": sparql.mainGraph},
		success: function(data) {
			callback(data, rootId);
			$("<button type='button' class='btn btn-default sparqlBtn'>SPARQL</button>")
				.click(function() {
					window.open(getSparqlLink(query));
				})
				.appendTo($("#" + rootId));
		},
		headers: {
			"Accept": "application/sparql-results+json,*/*;q=0.9"
		}
	});
};

fetchAndDrawViz(sparql.queries.serializationsPerDoc, "pieChartDatasetSerializations", function(data, rootId) {
	drawPieChart({
    	rootId: rootId,
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
});


fetchAndDrawViz(sparql.queries.serializationsPerTriple,"pieChartTripleSerializations", function(data, rootId) {
	drawPieChart({
		rootId: rootId,
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
});

fetchAndDrawViz(sparql.queries.contentTypesPerDoc,"pieChartContentTypes", function(data, rootId) {
	drawPieChart({
		rootId: rootId,
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
});
fetchAndDrawViz(sparql.queries.contentTypesVsSerializationFormats,"pieChartContentTypesVsSer", function(data, rootId) {
	drawPieChart({
		rootId: rootId,
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
});
fetchAndDrawViz(sparql.queries.parseExceptions,"pieChartExceptions", function(data, rootId) {
	drawPieChart({
		rootId: rootId,
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
});
  
fetchAndDrawViz(sparql.queries.contentLengths,"barChartContentLength", function(data, rootId) {
	drawContentLengthBarChart({
		rootId: rootId,
		data: data.results.bindings,
	});
});

fetchAndDrawViz(sparql.queries.datasetsWithCounts,"barChartDatasets", function(data, rootId) {
	drawDatasetsBarChart({
		rootId: rootId,
		data: data.results.bindings,
	});
});





	
	
