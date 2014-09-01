// This way JS wont break on Internet Explorer when log statements
// are still in the code.
if (!console.log) {
  console = {log:function(){}};
};

var llVersion = 11;
var sparql = {
	url : "http://sparql.backend.lodlaundromat.org",
	mainGraph : "http://lodlaundromat.org#" + llVersion,
	basketGraph: "http://lodlaundromat.org#seedlist",
	queries : {
totalTripleCount :
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT (SUM(?triples) AS ?totalTriples) {\n\
    ?dataset llo:triples ?triples . \n\
}\n",
serializationsPerDoc :
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT ?contentType (COUNT(?doc) AS ?count) WHERE {\n\
  ?doc llo:contentType ?contentTypeString\n\
  BIND(REPLACE(?contentTypeString, \";.*\", \"\", \"i\") AS ?contentType)\n\
} GROUP BY ?contentType",
serializationsPerTriple :
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT (replace(str(?formatUri),\".*/\",\"\") as ?format) (SUM(?triples) AS ?count)\n\
WHERE {\n\
  ?datadoc llo:serializationFormat ?formatUri .\n\
  ?datadoc llo:triples ?triples .\n\
}\n\
GROUP BY ?formatUri\n",
contentTypesPerDoc :
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT (replace(str(?formatUri),\".*/\",\"\") as ?format) (COUNT(?datadoc) AS ?count)\n\
WHERE {\n\
  ?datadoc llo:serializationFormat ?formatUri .\n\
}\n\
GROUP BY ?formatUri\n",
contentTypesVsSerializationFormats:
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT ?matchType (COUNT(?datadoc) AS ?count)\n\
WHERE {\n\
  ?datadoc llo:contentType ?contentType .\n\
  ?datadoc llo:serializationFormat ?formatUri .\n\
  MINUS {?datadoc llo:serializationFormat <http://www.w3.org/ns/formats/RDFa>}#unfair to take this one into account, as http content type of rdfa will be the html page\n\
  FILTER(!contains(str(?contentType), \"zip\"))\n\
  BIND(if(contains(str(?contentType), \"n3\"), \"turtle\", LCASE(?contentType)) AS ?contentType)#make http content types consistent with our serialization formats\n\
  BIND(LCASE(replace(str(?formatUri),\".*/\",\"\")) AS ?format)#only take local name of uri, and to lower case for easy comparison\n\
  BIND(if(contains(str(?formatUri), \"RDF_XML\"), \"rdf+xml\", ?formatUri) AS ?formatUri)\n\
  BIND(if (contains(str(?contentType), ?format), \"matches\", \"does not match\") AS ?matchType)\n\
}\n\
GROUP BY ?matchType",
contentLengths :
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT ?clength ?bcount WHERE {\n\
  ?doc llo:contentLength ?clength ;\n\
    llo:byteCount ?bcount.\n\
  MINUS {\n\
    ?doc llo:archiveContains []\n\
  }\n\
  MINUS {[] llo:archiveContains ?doc}\n\
  FILTER(!STRENDS(str(?doc), \".bz2\"))\n\
  FILTER(!STRENDS(str(?doc), \".gz\"))\n\
}",
datasetsWithCounts :
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT ?md5 ?doc ?triples ?duplicates {\n\
  []  a llo:URL ;\n\
    llo:triples ?triples;\n\
    llo:duplicates ?duplicates ;\n\
    llo:url ?doc ;\n\
    llo:md5 ?md5 .\n\
  FILTER(?triples > 0)\n\
}",
exceptionCounts:
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT (COUNT(?datadoc1) AS ?count1) (COUNT(?datadoc2) AS ?count2) (COUNT(?datadoc3) AS ?count3)\n\
WHERE {\n\
  {\n\
    ?datadoc1 llo:status ?status .\n\
    FILTER (str(?status) NOT IN (\"true\"))\n\
  } UNION {\n\
    ?datadoc2 llo:status \"true\"^^xsd:string .\n\
    ?datadoc2 llo:message ?message2 .\n\
  } UNION {\n\
    ?datadoc3 llo:status \"true\"^^xsd:string .\n\
    FILTER NOT EXISTS { ?datadoc3 llo:message ?message3 }\n\
  }\n\
}\n",
wardrobeListing:
"PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT ?md5 ?url ?triples\n\
WHERE {\n\
  ?datadoc llo:url ?url .\n\
  ?datadoc llo:md5 ?md5 .\n\
  OPTIONAL { ?datadoc llo:triples ?triples . }\n\
}\n",
queryBasketContents: function(basketGraph, mainGraph) {
return "\PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT ?url ?dateAdded ?startUnpack ?endUnpack ?startClean ?endClean\n\
WHERE {\n\
  GRAPH <" + basketGraph + "> {\n\
   	?datadoc llo:url ?url ;\n\
      llo:added ?dateAdded .\n\
      OPTIONAL {\n\
	    GRAPH <" + mainGraph + "> {\n\
	      OPTIONAL {?datadoc llo:startUnpack ?startUnpack}\n\
	      OPTIONAL {?datadoc llo:endUnpack ?endUnpack}\n\
	      OPTIONAL {?datadoc llo:startClean ?startClean}\n\
	      OPTIONAL {?datadoc llo:endClean ?endClean}\n\
	   }\n\
     }\n\
  }\n\
}\n";
},
datasetInfo: function(md5) {
return "PREFIX llo: <http://lodlaundromat.org/ontology/>\n\
PREFIX ll: <http://lodlaundromat/org/resource/>\n\
SELECT ?datadoc ?p ?o ?label {\n\
  ?datadoc llo:md5 \"" + md5 + "\"^^xsd:string .\n\
  ?datadoc ?p ?o .\n\
  OPTIONAL{?p rdfs:label ?label}\n\
}";
}
	}
};

var api = {
  "laundryBasket": {
    "seedUpdateApi": "http://backend.lodlaundromat.org"
  },
  "namespace": "http://lodlaundromat.org/vocab#",
  "wardrobe": {
    "download": function(md5) {
      return "http://download.lodlaundromat.org/" + md5;
    }
  }
};


var getSparqlLink = function(query) {
  return "/sparql?query=" + encodeURIComponent(query);
};


// Init loader.
$.ajaxSetup({
  beforeSend: function() {
    $('#loader').show();
  },
  complete: function(){
    $('#loader').hide();
    if (goToHash) goToHash();
  },
  success: function() {},
  url : sparql.url,
});

$("<div id='loader'><img src='/imgs/loader.gif'></div>").appendTo($("body"));



/**
 * helpers
 */

var formatPercentage = d3.format("%");
var formatThousands = d3.format(",g");
var formatLargeShortForm = d3.format(".2s");
var formatNumber = d3.format(",n");

var goToHash = function(){
  if(window.location.hash) {
    $.scrollTo($(window.location.hash), { duration: 500 });
  }
};

$(document).ready(function(){});

var modalDiv = $("<div class='modal  fade'  tabindex='-1' role='dialog' aria-hidden='true'></div>")
.html('<div class="modal-dialog modal-lg ">' +
'  <div class="modal-content">' +
'    <div class="modal-header">' +
'    </div>' +
'    <div class="modal-body">' +
'      <p>One fine body&hellip;</p>' +
'    </div>' +
'    <div class="modal-footer"></div>' + 
'  </div><!-- /.modal-content -->' +
'</div><!-- /.modal-dialog -->')
.appendTo($("body"));
var modal = modalDiv.modal({show: false});


/**
 * config {
 *  header: null, string, or jquery el
 *  content: string (text) or jquery el
 *  footer: null, string(html), or jquery el
 * }
 */
var drawModal = function(config) {
  var header = modalDiv.find(".modal-header");
  if (!config.header) {
    if (header.length > 0) modalDiv.find(".modal-header").remove();
  } else {
    if (header.length == 0) header = $("<div class='modal-header'></div>").prependTo(modalDiv.find(".modal-content"));
    if (typeof config.header == "string") {
      modalDiv.find(".modal-header").html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '<h4 class="modal-title">' + config.header + '</h4>');
    } else {
      modalDiv.find(".modal-header").empty().append(config.header);
    }
  }
  modalDiv.find(".modal-body").empty().append(config.content);
  modal.modal("show");
};


var showMetadataBox = function(md5) {
  $.ajax({

	    "headers": {
	      "Accept": "application/sparql-results+json,*/*;q=0.9"
	    },
	    "success": function(data) {
	      if (!data || !data.results || !data.results.bindings || data.results.bindings.length == 0) {
	    	  drawModal({header: "Dataset Properties", content: $('<div class="alert alert-danger" role="alert">No dataset properties found...</div>')});
	      } else {
		      var table = $("<table class='table'></table>");
		      var addRow = function(config) {
		        var row = $("<tr></tr>").appendTo(table);
		        if (config.rowClass) row.addClass(config.rowClass);
		        if (config.midHeader) row.css("font-weight", "bold");
		        for (var i = 0; i < config.values.length; i++) {
		          var col = $("<td></td>");
		          if (config.isHeader) col = $("<th></th>");
		          if (config.midHeader) col.attr("colspan", "2");
		          row.append(col);
		          var arg = config.values[i];
		          if (typeof arg == "string") {
		            col.html(arg);
		          } else {
		            col.append(arg);
		          }
		          if (i == 0 && config.indentFirstCol) col.css("padding-left", "15px");
		        }
		      };
		      $.each(data.results.bindings, function(index, triple) {
		    	  var rowHeader = (triple.label && triple.label.value? triple.label.value: triple.p.value);
		        addRow({values: [rowHeader, triple.o.value]});
		      });
		      drawModal({header: "Dataset Properties", content: table});
	      }
	    },
	    "url": sparql.url
	  });
};


/**
 * draw header
 */
var drawHeader = function() {
  var addItem = function(config) {
    var item = $("<li></li>").appendTo(topNavBar);
    if (config.active) item.addClass("active");
    var anchor = $("<a></a>").attr("href", config.href).appendTo(item);
    if (config.newWindow) anchor.attr("target", "_blank");
//    $("<img/>").attr("src", config.img).appendTo(anchor);
    $("<span></span>").text(config.title).appendTo(anchor);
  };
  var items = [
       {href: "/", img: "/imgs/laundry.png", title: "Main Page"},
       {href: "/basket", img: "/imgs/basket.png", title: "Laundry Basket"},
       {href: "https://github.com/LODLaundry/llWashingMachine", newWindow: true, img: "/imgs/washingMachine.png", title: "Washing Machine"},
       {href: "/wardrobe", img: "/imgs/wardrobe.png", title: "Wardrobe"},
       {href: "/visualizations", img: "/imgs/analysis.png", title: "Analysis"},
       {href: "/sparql", img: "/imgs/labels.png", title: "SPARQL"},
       
     ];
  var lastIndexOf = document.URL.lastIndexOf("/");
  var basename = "";
  if (lastIndexOf < document.URL.length) {
    basename = document.URL.substring(lastIndexOf + 1);
  }
  var hashTagIndex = basename.indexOf("#");
  if (hashTagIndex == 0) {
    basename == "";
  } else if (hashTagIndex > 0) {
    basename = basename.substring(0, hashTagIndex-1);
  }
  
  if (basename.length == 0) basename = "index.html";
  
  
  
  for (var i = 0; i < items.length; i++) {
    if (basename == items[i].href) items[i].active = true;
    addItem(items[i]);
  }
};
drawHeader();

var getAndDrawCounter = function() {
  var draw = function(count) {
    var holder = $('.counter');
    var countString = count.toString();
    var charsLeft = countString.length;
    for (var i = 0; i < countString.length; i++) {
//    <span class="position"><span class="digit static" style="top: 0px; opacity: 1;">0</span></span>
      holder.append($('<span>' + countString.charAt(i) + '</span>'));
      charsLeft = charsLeft - 1;
      if (charsLeft % 3 == 0 && charsLeft > 0) {
        holder.append("<span>.</span>");
      }
    }
  };
  if ($('.counter').length > 0) {
    $.ajax({
      url: sparql.url,
      data: [
//             {name: "default-graph-uri", value: sparql.basketGraph},
             {name: "query", value: sparql.queries.totalTripleCount}
      ],
      success: function(data) {
        if (data.results && data.results.bindings && data.results.bindings.length > 0 && data.results.bindings[0].totalTriples && data.results.bindings[0].totalTriples.value > 0) {
          draw(data.results.bindings[0].totalTriples.value);
        } else {
        	$("#counterWrapper").hide();
        }
      },
      headers: {
        "Accept": "application/sparql-results+json,*/*;q=0.9"
      }
    });
  }
};
getAndDrawCounter();

//this function is useful for printing charts to pdf.
var deleteEveryDivExcept = function(divId) {
  $("div").hide();
  $("h1").hide();
  $("h2").hide();
  $("h3").hide();
  var targetDiv = $("#" + divId);
  targetDiv.parents().show();
  targetDiv.show();
};
/**
 * draw google analytics
 */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-51130014-1', 'lodlaundry.github.io');
  ga('send', 'pageview');

