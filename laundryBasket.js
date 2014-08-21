var basketContents = null;
var dataTable;

$( document ).ready(function() {
  $.ajax({
    data: {
      "named-graph-uri": sparql.mainGraph,
      query: sparql.queries.queryBasketContents
    },
    headers: {
      "Accept": "application/sparql-results+json,*/*;q=0.9"
    },
    success: function(data) {
      basketContents = data;
      drawTable();
    },
    url: sparql.url
  });
});

function status(result) {
  if (!result.start_unpack) {
    return "pending";
  } else if (!result.end_unpack) {
    return "unpacking";
  } else if (!result.start_clean) {
    return "unpacked";
  } else if (!result.end_clean) {
    return "cleaning";
  } else {
    return "cleaned";
  }
}

var drawTable = function() {
  var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="laundryBasketTable"></table>');
  $('#tableWrapper').html(table);
  
  if (!basketContents || !basketContents.results || !basketContents.results.bindings) {
    return;
  }
  
  var rows = [];
  for (var i = 0; i < basketContents.results.bindings.length; i++) {
    var result = basketContents.results.bindings[i];
    var row = [];
    row.push("");//this is where the row index comes automatically
    row.push(result.url.value);
    row.push(status(result));
    rows.push(row);
  }
  
  var dTableConfig = {
      "data": rows,
      "sScrollX": "100%",
      "bAutoWidth": true,
      "iDisplayLength": 25,
      "columns":
          [{ "title": "index" },
          { "title": "URL" },
          { "title": "Status" }],
      "language": {
         "decimal": ",",
         "thousands": "."
      },
      "deferRender": true,
      "fnDrawCallback": function ( oSettings ) {
      /* Need to redo the counters if filtered or sorted */
      if ( oSettings.bSorted || oSettings.bFiltered )
      {
        for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
        {
          $('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
        }
      }
    },
    "aoColumnDefs":
        [{ "bSearchable": true, "aTargets": [1] },
         { "bSortable": false, "aTargets": [0] },
         { "sWidth": "30px", "aTargets": [0] }],
    "aaSorting": [[2, 'desc']]
  };
  dataTable = table.dataTable(dTableConfig);
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

