// This way JS wont break on Internet Explorer when log statements
// are still in the code.
if (!console.log) {
  console = {log:function(){}};
};


var sparql = {
	url : "http://sparql.backend.lodlaundromat.org",
	mainGraph : "http://lodlaundromat.org#11",
	basketGraph: "http://lodlaundromat.org#seedlist",
	queries : {
totalTripleCount :
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT (SUM(?triples) AS ?totalTriples) {\n\
    ?dataset ll:triples ?triples . \n\
}\n",
serializationsPerDoc :
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?contentType (COUNT(?doc) AS ?count) WHERE {\n\
  ?doc ll:content_type ?contentTypeString\n\
  BIND(REPLACE(?contentTypeString, \";.*\", \"\", \"i\") AS ?contentType)\n\
} GROUP BY ?contentType",
serializationsPerTriple :
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?format (SUM(?triples) AS ?count)\n\
WHERE {\n\
  ?datadoc ll:serialization_format ?format .\n\
  ?datadoc ll:triples ?triples .\n\
}\n\
GROUP BY ?format\n",
contentTypesPerDoc :
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?format (COUNT(?datadoc) AS ?count)\n\
WHERE {\n\
  ?datadoc ll:serialization_format ?format .\n\
}\n\
GROUP BY ?format\n",
contentTypesVsSerializationFormats:
/**
 * Some explanations:
 * - Do not include documents with serialization format RDFa,
 *   as these should not be transferred with their own content type
 *   (but as part of e.g. an HTTP page).
 * - Replace the N3 content type string with Turtle
 *   to make our matching function easier.
 */
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?matchType (COUNT(?datadoc) AS ?count)\n\
WHERE {\n\
  ?datadoc ll:content_type ?contentType .\n\
  ?datadoc ll:serialization_format ?format .\n\
  FILTER(str(?format) != \"rdfa\")\n\
  FILTER(!contains(str(?contentType), \"zip\"))\n\
  BIND(if(contains(str(?contentType), \"n3\"), \"turtle\", ?contentType) AS ?contentType)\n\
  BIND(if (contains(str(?contentType), str(?format)), \"matches\", \"does not match\") AS ?matchType)\n\
} GROUP BY ?matchType\n",
contentLengths :
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?clength ?bcount WHERE {\n\
  ?doc ll:content_length ?clength ;\n\
    ll:byte_count ?bcount.\n\
  MINUS {\n\
    ?doc ll:archive_contains []\n\
  }\n\
  MINUS {[] ll:archive_contains ?doc}\n\
  FILTER(!STRENDS(str(?doc), \".bz2\"))\n\
  FILTER(!STRENDS(str(?doc), \".gz\"))\n\
}",
datasetsWithCounts :
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?md5 ?doc ?triples ?duplicates {\n\
  []  a ll:URL ;\n\
    ll:triples ?triples;\n\
    ll:duplicates ?duplicates ;\n\
    ll:url ?doc ;\n\
    ll:md5 ?md5 .\n\
  FILTER(?triples > 0)\n\
}",
exceptionCounts:
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT (COUNT(?datadoc1) AS ?count1) (COUNT(?datadoc2) AS ?count2) (COUNT(?datadoc3) AS ?count3)\n\
WHERE {\n\
  {\n\
    ?datadoc1 ll:status ?status .\n\
    FILTER (str(?status) NOT IN (\"true\"))\n\
  } UNION {\n\
    ?datadoc2 ll:status \"true\"^^xsd:string .\n\
    ?datadoc2 ll:message ?message2 .\n\
  } UNION {\n\
    ?datadoc3 ll:status \"true\"^^xsd:string .\n\
    FILTER NOT EXISTS { ?datadobackend.lodlaundromat.d2s.labs.vu.nl/basketc3 ll:message ?message3 }\n\
  }\n\
}\n",
wardrobeListing:
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?md5 ?url ?triples\n\
WHERE {\n\
  GRAPH <http://lodlaundromat.org#11> {\n\
    ?datadoc ll:url ?url .\n\
    ?datadoc ll:md5 ?md5 .\n\
    OPTIONAL { ?datadoc ll:triples ?triples . }\n\
  }\n\
}\n",
queryBasketContents: function(basketGraph, mainGraph) {
return "\PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?url ?dateAdded ?start_unpack ?end_unpack ?start_clean ?end_clean\n\
WHERE {\n\
  GRAPH <" + basketGraph + "> {\n\
   	?datadoc ll:url ?url ;\n\
      ll:added ?dateAdded .\n\
      OPTIONAL {\n\
	    GRAPH <http://lodlaundromat.orgg#11> {\n\
	      OPTIONAL {?datadoc ll:start_unpack ?start_unpack}\n\
	      OPTIONAL {?datadoc ll:end_unpack ?end_unpack}\n\
	      OPTIONAL {?datadoc ll:start_clean ?start_clean}\n\
	      OPTIONAL {?datadoc ll:end_clean ?end_clean}\n\
	   }\n\
     }\n\
  }\n\
}\n";
},
datasetInfo: function(md5) {
return "PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?datadoc ?p ?o ?label {\n\
  ?datadoc ll:md5 \"" + md5 + "\"^^xsd:string .\n\
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
  return "sparql.html?query=" + encodeURIComponent(query);
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
  success: function() {}
});

$("<div id='loader'><img src='imgs/loader.gif'></div>").appendTo($("body"));



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
	    "data": {
	      "named-graph-uri": sparql.mainGraph,
	      "query": sparql.queries.datasetInfo(md5)
	    },
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
       {href: "index.html", img: "imgs/laundry.png", title: "Main Page"},
       {href: "laundryBasket.html", img: "imgs/basket.png", title: "Laundry Basket"},
       {href: "https://github.com/LODLaundry/llWashingMachine", newWindow: true, img: "imgs/washingMachine.png", title: "Washing Machine"},
       {href: "wardrobe.html", img: "imgs/wardrobe.png", title: "Wardrobe"},
       {href: "visualizations.html", img: "imgs/analysis.png", title: "Analysis"},
       {href: "sparql.html", img: "imgs/labels.png", title: "SPARQL"},
       
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
      data: {query:sparql.queries.totalTripleCount,"named-graph-uri": sparql.mainGraph},
      success: function(data) {
        if (data.results && data.results.bindings && data.results.bindings.length > 0 && data.results.bindings[0].totalTriples) {
          draw(data.results.bindings[0].totalTriples.value);
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

