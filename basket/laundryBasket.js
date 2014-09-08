var basketContents = null;
var dataTable;



$( document ).ready(function() {
  $.ajax({
    data: [
           {name: "default-graph-uri", value: sparql.mainGraph},
           {name: "default-graph-uri", value: sparql.basketGraph},
           {name: "query", value: sparql.queries.queryBasketContents(sparql.basketGraph, sparql.mainGraph)},
    ],
    headers: {
      "Accept": "text/csv,*/*;q=0.9"
    },
    success: function(data) {
      basketContents = CSV.parse(data);
      drawTable();
    },
    url: sparql.url
  });
});

function status(result) {
	 //0: url, 1: dateAdded 2: start_unpack 3: end_unpack 4: start_clean 5: end_clean
  if (!result[2]) {
    return "pending";
  } else if (!result[3]) {
    return "unpacking";
  } else if (!result[4]) {
    return "unpacked";
  } else if (!result[5]) {
    return "cleaning";
  } else {
    return "cleaned";
  }
}

var drawTable = function() {
  var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="laundryBasketTable"></table>');
  $('#tableWrapper').html(table);
  
  if (!basketContents || basketContents.length == 0) {
    return;
  }
  
  var rows = [];
  for (var i = 0; i < basketContents.length; i++) {
	  //0: url, 1: dateAdded 2: start_unpack 3: end_unpack 4: start_clean 5: end_clean
    var result = basketContents[i];
    var row = [];
    var urlCell = "<span class='longtitle' data-toggle='tooltip' data-placement='top' title='" + result[0] + "'>" + shortenUrl(result[0]) + "</span>";
    row.push(urlCell);
    row.push(status(result));
    rows.push(row);
  }
  
  var dTableConfig = {
      "data": rows,
      "sScrollX": "100%",
      "bAutoWidth": true,
      "iDisplayLength": 25,
      "columns":[
//          [{ "title": "index" },
          { "title": "URL" },
          { "title": "Status" }
          ],
      "language": {
         "decimal": ",",
         "thousands": "."
      },
      "deferRender": true,
      "fnDrawCallback": function ( oSettings ) {
    	  $('.longtitle').tooltip();
    },
    "aoColumnDefs": [
        { "bSearchable": true, "aTargets": [0,1] },
         { "bSortable": true, "aTargets": [0,1] },
         ],
    "aaSorting": [[1, 'desc']]
  };
  dataTable = table.dataTable(dTableConfig);
  
  
  $("<div class='sparqlQueryDiv'><button type='button' class='btn btn-default sparqlBtn'>SPARQL</button></div>")
  
	  .click(function() {
		  window.open(getSparqlLink(sparql.queries.queryBasketContents(sparql.basketGraph, sparql.mainGraph)) + "&named-graph-uri=" + encodeURIComponent(sparql.basketGraph) + "&named-graph-uri=" + encodeURIComponent(sparql.mainGraph));
		  })
	  .prependTo($("#laundryBasketTable_wrapper"));
};

$(window).on('resize', function () {
  dataTable.fnAdjustColumnSizing();
} );

$("#newDirtyLaundry").keyup(function() {
  $(".submitStatus").hide(400);
});

function storeUrl() {
  var failureMsg = function(customMsg) {
	  var msg = "<span class=\"label label-danger\">";
	  if (customMsg && customMsg.length > 0) {
		  msg += customMsg + ".";
	  } else {
		  msg += "Something went wrong. Is the url correct?"; 
	  }
	  msg += " If this problem persists, please drop us a <a style=\"color:#2C2C2C\" href=\"https://github.com/LODLaundry/lodlaundry.github.io/issues\">Github issue</a>!</span>";
	  return msg;
  };
  var successMsg =
      "<span class=\"label label-success\">Successfully received!</span>";
  
  var url = $("#newDirtyLaundry").val().trim();
  if (url.length > 0) {
    $.ajax({
      data: {
        url: url
      },
      error: function(response,textStatus,errorThrown) {
    	  console.log(arguments);
        $(".submitStatus").empty().hide().append(failureMsg(errorThrown)).show(400);
      },
      success: function() {
        $(".submitStatus").empty().hide().append(successMsg).show(400);
      },
      type: "GET",
      url: api.laundryBasket.seedUpdateApi
    });
  }
}

