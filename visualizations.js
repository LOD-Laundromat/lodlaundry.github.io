// Add tooltip to DOM, that is used in a barchart.
var tooltip = $('<div id="tooltip" class="hidden"><p><span id="value">100</span></p></div>');
$("#barChartDatasets").append(tooltip);

var formatSerialization = function(format) {
  switch (format) {
    case "xml":
      return "XML";
    case "ntriples":
      return "N-Triples";
    case "rdfa":
      return "RDFa";
    case "turtle":
      return "Turtle";
    case "trig":
      return "TriG";
    default:
      return format;
  };
};

var fetchAndDrawViz = function(query, rootId, callback) {
  $.ajax({
    data: [
           {name: "default-graph-uri", value: sparql.mainGraph},
           {name: "default-graph-uri", value: sparql.basketGraph},
           {name: "query", value: query}
    ],
    headers: {
      "Accept": "application/sparql-results+json,*/*;q=0.9"
    },
    success: function(data) {
      callback(data, rootId);
      $("<button type='button' class='btn btn-default sparqlBtn'>SPARQL</button>").click(function() {
        window.open(getSparqlLink(query));
      }).appendTo($("#" + rootId));
    },
    url: sparql.url
  });
};

fetchAndDrawViz(
  sparql.queries.serializationsPerTriple,
  "pieChartTripleSerializations",
  function(data, rootId) {
    drawPieChart({
      aggregate: function(bindings) {
        return bindings.count.value;
      },
      data: data.results.bindings,
      //hideLabelsBelow: 0.02,
      isArray: true,
      rootId: rootId,
      sumBy: function(bindings) {
        return formatSerialization(bindings.format.value);
      },
      totalUnit: "triples",
      totalLabel: "TOTAL",
      dimensions: {
    	  innerRadius: 60,
      }
    });
  }
);

fetchAndDrawViz(
  sparql.queries.serializationsPerDoc,
  "pieChartDatasetSerializations",
  function(data, rootId) {
    drawPieChart({
      rootId: rootId,
      totalUnit: "documents",
      totalLabel: "TOTAL",
      hideLabelsBelow: 0.02,
      data: data.results.bindings,
      isArray: true,
      sumBy: function(bindings) {
        return formatSerialization(bindings.contentType.value);
      },
      aggregate: function(bindings) {
        return bindings.count.value;
      },
      dimensions: {
    	  width: 800,
      }
    });
  }
);

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
      return formatSerialization(bindings.format.value);
    },
    aggregate: function(bindings){return bindings.count.value;},
  });
});

fetchAndDrawViz(sparql.queries.contentTypesVsSerializationFormats,
  "pieChartContentTypesVsSer", 
  function(data, rootId) {
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

fetchAndDrawViz(
  sparql.queries.exceptionCounts,
  "pieChartExceptions",
  function(data, rootId) {
    drawPieChart({
      aggregate: function(bindings){return 1;},
      data: data.results.bindings,
      dimensions: {
        width: 600
      },
      hideLabelsBelow: 0.04,
      isArray: true,
      rootId: rootId,
      sumBy: function(bindings) {
    	 
    	  return null;
        return formatSerialization(bindings.format.value);
      },
      totalUnit: "documents",
      totalLabel: "TOTAL",
    });
  }
);

fetchAndDrawViz(
  sparql.queries.contentLengths,
  "barChartContentLength",
  function(data, rootId) {
    drawContentLengthBarChart({
      data: data.results.bindings,
      rootId: rootId
    });
  }
);

fetchAndDrawViz(
  sparql.queries.datasetsWithCounts,
  "barChartDatasets",
  function(data, rootId) {
    drawDatasetsBarChart({
      data: data.results.bindings,
      rootId: rootId
    });
  }
);

