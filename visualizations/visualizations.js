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

var fetchAndDrawViz = function(query, rootId, callback, overWriteConfig) {
    var ajaxConfig = {
            data: [
                   {name: "default-graph-uri", value: sparql.graphs.main},
                   {name: "default-graph-uri", value: sparql.graphs.seedlist},
                   {name: "default-graph-uri", value: sparql.graphs.metrics},
                   {name: "query", value: sparql.queries.getDegreeStats}
            ],
            headers: {
              "Accept": "text/tab-separated-values",
            },
            success: function(data) {
              callback(d3.tsv.parse(data), rootId);
              $("<button type='button' class='btn btn-default sparqlBtn'>SPARQL</button>").click(function() {
                window.open(getSparqlLink(query));
              }).appendTo($("#" + rootId));
            },
            url: sparql.url
          };
    if (overWriteConfig) {
        $.extend(ajaxConfig, overWriteConfig);
    }
  $.ajax(ajaxConfig);
};



fetchAndDrawViz(
  null,
  "degreeDist",
  function(data, rootId) {
	  drawDegreeBarChart({
      data: data,
      rootId: rootId,
    });
  },
  {
      data: [//optimize by -only- querying metrics graph
             {name: "default-graph-uri", value: sparql.graphs.metrics},
             {name: "query", value: sparql.queries.getDegreeStats}
      ] 
  });



fetchAndDrawViz(
  sparql.queries.serializationsPerTriple,
  "pieChartTripleSerializations",
  function(data, rootId) {
    drawPieChart({
      aggregate: function(bindings) {
        return bindings.count;
      },
      data: data,
      hideLabelsBelow: 0.05,
      isArray: true,
      rootId: rootId,
      sumBy: function(bindings) {
        return formatSerialization(bindings.format);
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
      data: data,
      isArray: true,
      sumBy: function(bindings) {
        return formatSerialization(bindings.contentType);
      },
      aggregate: function(bindings) {
        return bindings.count;
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
    data: data,
    isArray: true,
    sumBy: function(bindings) {
      return formatSerialization(bindings.format);
    },
    aggregate: function(bindings){return bindings.count;},
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
    data: data,
    isArray: true,
    sumBy: function(bindings) {
      return bindings.matchType;
    },
    aggregate: function(bindings){return bindings.count;},
  });
});

fetchAndDrawViz(
  sparql.queries.exceptionCounts,
  "pieChartExceptions",
  function(data, rootId) {
    drawPieChart({
      aggregate: function(bindings){return 1;},
      data: data,
      dimensions: {
        width: 600
      },
      hideLabelsBelow: 0.04,
      isArray: true,
      rootId: rootId,
      sumBy: function(bindings) {
    	 
    	  return null;
        return formatSerialization(bindings.format);
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
      data: data,
      rootId: rootId
    });
  }
);

fetchAndDrawViz(
  sparql.queries.datasetsWithCounts,
  "barChartDatasets",
  function(data, rootId) {
    drawDatasetsBarChart({
      data: data,
      rootId: rootId
    });
  });

