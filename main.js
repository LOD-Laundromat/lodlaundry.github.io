/*
JSlint gives a whole host of errors on this one:
  - Read only.
  - Empty block.
  - Expected `;` and instead saw `}`.
// This way JS wont break on Internet Explorer when log statements
// are still in the code.
if (!console.log) {
  console = {log:function(){}}
};
*/

var contentLengthsSparql = 
"PREFIX ll: <http://lodlaundromat.org/vocab#>\
SELECT ?clength ?bcount WHERE {\
  ?doc ll:http_content_length ?clength ;\
    ll:stream_byte_count ?bcount.\
  MINUS {\
    ?doc ll:archive_contains []\
  }\
  MINUS {[] ll:archive_contains ?doc}\
  FILTER(!STRENDS(str(?doc), \".bz2\"))\
  FILTER(!STRENDS(str(?doc), \".gz\"))\
}";

var contentTypesPerDocSparql =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\
SELECT ?contentType (COUNT(?doc) AS ?count) WHERE {\
  ?doc ll:http_content_type ?contentTypeString\
  BIND(REPLACE(?contentTypeString, \";.*\", \"\", \"i\") AS ?contentType)\
} GROUP BY ?contentType";

/**
 * Some explanations:
 * - Do not include documents with serialization format RDFa,
 *   as these should not be transferred with their own content type
 *   (but as part of e.g. an HTTP page).
 * - Replace the N3 content type string with Turtle
 *   to make our matching function easier.
 */
var contentTypesVsSerializationFormatsSparql =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?matchType (COUNT(?doc) AS ?count)\n\
WHERE {\n\
  ?datadoc ll:http_content_type ?contentType .\n\
  ?datadoc ll:serialization_format ?serializationFormat .\n\
  FILTER(str(?serializationFormat) != \"rdfa\")\n\
  FILTER(!contains(str(?contentType), \"zip\"))\n\
  BIND(if(contains(str(?contentType), \"n3\"), \"turtle\", ?contentType) AS ?contentType)\n\
  BIND(if (contains(str(?contentType), str(?serializationFormat)), \"matches\", \"does not match\") AS ?matchType)\n\
} GROUP BY ?matchType\n";

var datasetInfoSparql1 = "\
PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?datadoc ?p ?o\n\
WHERE {\n\
  ?datadoc ll:md5 \"";
var datasetInfoSparql2 =
"\"^^xsd:string .\n\
  ?datadoc ?p ?o .\n\
}\n";

var termLabelSparql1 = "\
PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?label\n\
WHERE {\n\
  ";
var termLabelSparql2 ="\
rdfs:label ?label .\n\
}\n";

var datasetsWithCountsSparql =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?md5 ?doc ?triples ?duplicates {\n\
  []  a ll:URL ;\n\
    ll:triples ?triples;\n\
    ll:duplicates ?duplicates ;\n\
    ll:url ?doc .\n\
  FILTER(?triples > 0)\n\
}";

var parseExceptionsSparql =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?exception ?message ?triples WHERE {\n\
  ?doc a ll:URL .\n\
  BIND(EXISTS{?doc ll:exception []} AS ?exception)\n\
  BIND(EXISTS{?doc ll:message []} AS ?message)\n\
  OPTIONAL {?doc ll:triples ?triples}\n\
}";

var serializationsPerDocSparql =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?serializationFormat (COUNT(?doc) AS ?count)\n\
WHERE {\n\
  GRAPH <http://lodlaundromat.org#10> {\n\
    ?doc ll:serialization_format ?serializationFormat .\n\
  }\n\
}\n\
GROUP BY ?serializationFormat\n";

var serializationsPerTripleSparql =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?serializationFormat (SUM(?triples) AS ?count)\n\
WHERE {\n\
  GRAPH <http://lodlaundromat.org#10> {\n\
    [] ll:serialization_format ?serializationFormat ;\n\
       ll:triples ?triples .\n\
  }\n\
}\n\
GROUP BY ?serializationFormat\n";

var totalTripleCountSparql =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT (SUM(?triples) AS ?totalTriples) {?dataset ll:triples ?triples}";

var api = {
  "laundryBasket": {
    "all": "lod_basket.txt",
    "endpoint": "http://lodlaundry.wbeek.ops.few.vu.nl/basket"
  },
  "namespace": "http://lodlaundromat.org/vocab#",
  "wardrobe": {
    "all": "testInput.json",
    "download": function(md5) {
      return "http://lodlaundry.wbeek.ops.few.vu.nl/data/" + md5
          + "/clean.nt.gz";
    }
  }
};

var sparql = {
  //url: "http://virtuoso.lodlaundromat.ops.few.vu.nl/sparql",
  "url": "http://lodlaundry.wbeek.ops.few.vu.nl/sparql/",
  "mainGraph": "http://lodlaundromat.org#10",
  "queries": {
    "totalTripleCount": totalTripleCountSparql,
    "serializationsPerDoc": serializationsPerDocSparql,
    "serializationsPerTriple": serializationsPerTripleSparql,
    "contentTypesPerDoc": contentTypesPerDocSparql,
    "contentTypesVsSerializationFormats":
        contentTypesVsSerializationFormatsSparql,
    "parseExceptions": parseExceptionsSparql,
    "contentLengths": contentLengthsSparql,
    "datasetsWithCounts": datasetsWithCountsSparql
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
  var url = "http://lodlaundry.wbeek.ops.few.vu.nl/infobox?md5=" + md5;
  drawModal({
    "header": "Monkeys",
    "content": httpGet(url)
  })
};

function httpGet(url) {
  var xmlHttp = null;
  xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", url, false);
  //xmlHttp.send(null);
  return xmlHttp.responseText;
}


/**
 * draw header
 */
var drawHeader = function() {
  var header = $("<div id='pageHeader' class='navbar navbar-default navbar-fixed-top'></div>").appendTo($("body"));
  var container = $('<div class="container"></div>').appendTo(header);
  var menuList = $('<ul class="nav navbar-nav"></ul>').appendTo(container);
  var addItem = function(config) {
    var item = $("<li></li>").appendTo(menuList);
    if (config.active) item.addClass("active");
    var anchor = $("<a></a>").attr("href", config.href).appendTo(item);
    if (config.newWindow) anchor.attr("target", "_blank");
//    $("<img/>").attr("src", config.img).appendTo(anchor);
    $("<span></span>").text(config.title).appendTo(anchor);
  };
  var items = [
       {href: "index.html", img: "imgs/laundry.png", title: "Main Page"},
       {href: "laundryBasket.html", img: "imgs/basket.png", title: "Laundry Basket"},
       {href: "https://github.com/LODLaundry/LOD-Washing-Machine", newWindow: true, img: "imgs/washingMachine.png", title: "Washing Machine"},
       {href: "wardrobe.html", img: "imgs/wardrobe.png", title: "Wardrobe"},
       {href: "visualizations.html", img: "imgs/analysis.png", title: "Inventory"},
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
//  addItem(true, "index.html", "imgs/laundry.png", "Main Page");
//  addItem(true, "index.html", "imgs/laundry.png", "Main Page");
  
  
//  header.html('<div class="container"><ul class="nav navbar-nav">'+
//          '<li><a href="index.html"><img src="imgs/laundry.png" style="width: 60px; height: 60px;"> Main page</a></li>'+
//          '<li><a href="index.html"><img src="imgs/laundry.png" style="width: 60px; height: 60px;"> Main page</a></li>'+
//          '<li><a href="#">About</a></li>'+
//          '<li><a href="#">Contact</a></li>'+
//        '</ul></div>');
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
      data: {query:sparql.queries.totalTripleCount,"default-graph-uri": sparql.mainGraph},
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


/**
 * draw google analytics
 */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-51130014-1', 'lodlaundry.github.io');
  ga('send', 'pageview');

