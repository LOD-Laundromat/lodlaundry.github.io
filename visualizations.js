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
}

var fetchAndDrawViz = function(query, rootId, callback) {
  $.ajax({
    data: {
      "default-graph-uri": sparql.mainGraph,
      query: query
    },
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
        return formatSerialization(bindings.format.value);
      },
      aggregate: function(bindings) {
        return bindings.count.value;
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

var numberOfErrorDocsSparql = "\
PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT (COUNT(?datadoc1) AS ?count1) (COUNT(?datadoc2) AS ?count2) (COUNT(?datadoc3) AS ?count3)\n\
WHERE {\n\
  GRAPH <http://lodlaundromat.org#10> {\n\
    {\n\
      ?datadoc1 ll:status ?status .\n\
      FILTER (str(?status) NOT IN (\"true\"))\n\
    } UNION {\n\
      ?datadoc2 ll:status \"true\"^^xsd:string .\n\
      ?datadoc2 ll:message ?message2 .\n\
    } UNION {\n\
      ?datadoc3 ll:status \"true\"^^xsd:string .\n\
      FILTER NOT EXISTS { ?datadoc3 ll:message ?message3 }\n\
    }\n\
  }\n\
}\n";
fetchAndDrawViz(
  numberOfErrorDocsSparql,
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
/*
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
*/
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

