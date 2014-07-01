var basketContents = null;

$( document ).ready(function() {
  var queryBasketContents = "\
PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?url ?added ?start_unpack ?end_unpack ?start_clean\n\
WHERE {\n\
  GRAPH <http://lodlaundromat.org#10> {\n\
    ?datadoc ll:url ?url .\n\
    ?datadoc ll:added ?added .\n\
    OPTIONAL { ?datadoc ll:start_unpack ?start_unpack . }\n\
    OPTIONAL { ?datadoc ll:end_unpack ?end_unpack . }\n\
    OPTIONAL { ?datadoc ll:start_clean ?start_clean . }\n\
    FILTER NOT EXISTS { ?datadoc ll:end_clean ?end_clean . }\n\
  }\n\
}\n\
LIMIT 10\n";
  $.ajax({
    data: {
      "default-graph-uri": sparql.mainGraph,
      query: queryBasketContents
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
    return "cleaning";
  } else {
    return "cleaned";
  }
}

var dataTable;
var drawTable = function() {
  var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="laundryBasketTable"></table>');
  $('#tableWrapper').html(table);
  
  var rows = [];
  
  if (!basketContents || !basketContents.results || !basketContents.results.bindings) {
    return;
  }
  
  for (var i = 0; i < basketContents.results.bindings.length; i++) {
    var result = basketContents.results.bindings[i];
    var row = [];
    row.push("");//this is where the row index comes automatically
    row.push(result.url.value);
    row.push(status(result));
    rows.push(row);
    // @tbd Start/end unpack/clean
  }
  
  var dTableConfig = {
      "data": rows,
      "sScrollX": "100%",
      "bAutoWidth": true,
      "iDisplayLength": 25,
      "columns": [
          {  "title": "index"},//0
          { "title": "Seed" },//1
          { "title": "Added"},//2
          { "title": "Last crawled" },//3
      ],
      "language": {
          "decimal": ",",
          "thousands": "."
      },
      "createdRow": function ( row, data, index ) {
      },
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
        [{ "bSearchable": true, "aTargets": [ 1,2,3 ] },
         { "bSortable": false, "aTargets": [ 0 ] },
         { "sWidth": "30px", "aTargets": [0] }],
    "aaSorting": [[ 2, 'desc' ]]
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
  var failureMsg =
      "<span class=\"label label-danger\">Something went wrong... Is the url correct? If this problem persists, please drop us a <a href=\"https://github.com/LODLaundry/lodlaundry.github.io/issues\">Github issue</a>!</span>";
  var successMsg =
      "<span class=\"label label-success\">Successfully received!</span>";
  
  var url = $("#newDirtyLaundry").val().trim();
  if (url.length > 0) {
    $.ajax({
      data: {
        url: url
      },
      error: function() {
        $(".submitStatus").empty().hide().append(failureMsg).show(400);
      },
      success: function() {
        $(".submitStatus").empty().hide().append(successMsg).show(400);
      },
      type: "GET",
      url: api.laundryBasket.endpoint
    });
  }
}

