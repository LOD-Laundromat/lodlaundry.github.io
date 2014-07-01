var hoverDiv;
var wardrobeData = null;
var hasArchiveEntry = {};
var fromArchive = {};
var md5 = {};
var hideIcons = function() {
  hoverDiv.hide();
};

var formatInt = function(origValue) {
   var rx=  /(\d+)(\d{3})/;
      return String(origValue).replace(/^\d+/, function(w){
          while(rx.test(w)){
              w= w.replace(rx, '$1.$2');
          }
          return w;
      });
};

var getDownloadName = function(url) {
   if(url.lastIndexOf("#") != -1)       
     url = url.substring(0, url.lastIndexOf("#"));
   if(url.lastIndexOf(".") != -1)       
     url = url.substring(0, url.lastIndexOf("."));
   if (url.indexOf(url.length) == "/") url = url.substring(url.length-1);
   url = url.substring(url.lastIndexOf('/') + 1); 
    
   return url + "_clean.nt.gz";
};

var downloadSelectedCleaned = function() {
  $("#wardrobeTable tr.selected .downloadClean").each(function(){
    this.click();
  });
};
var downloadSelectedDirty = function() {
  $("#wardrobeTable tr.selected .downloadDirty").each(function(){
    this.click();
  });
};

var multiButtons;
var updateMultiSelectDownloads = function(url) {
  if ($("#wardrobeTable tr.selected").length > 0) {
    if (!multiButtons.is(':visible')) {
      multiButtons.slideDown();
//      multiButtons.slideDown(400, "swing", function(){$(this).remove;});
//      multiButtons.show("slow");
    }
  } else {
//    multiButtons.hide("slow", function(){$(this).remove;});
    if (multiButtons.is(':visible')) multiButtons.slideUp();
  }
  
};

var dataTable;
var drawTable = function() {
  var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="wardrobeTable"></table>');
  $('#tableWrapper').html(table);
  
  if (!wardrobeData || !wardrobeData.results || !wardrobeData.results.bindings) {
    return;
  }
  
  var rows = [];
  for (var i = 0; i < wardrobeData.results.bindings.length; i++) {
    var results = wardrobeData.results.bindings[i];
    var row = [];
    row.push("");//this is where the row index comes automatically
    row.push(results.md5.value);
    row.push(results.url.value);
    row.push(
        "<a class='downloadClean btn btn-default' title='Download the washed and cleaned data' target='_blank'><span class='glyphicon glyphicon-download'></span> Clean</a>" +
        "<a class='downloadDirty btn btn-default' title='Download original dirty dataset' href='" + results.url.value + "' target='_blank'><span class='glyphicon glyphicon-download'></span> Dirty</a>"
    );
    row.push(results.triples ? results.triples.value : 0);
    row.push("<button type='button' class='showDatasetInfo btn btn-default' title='Show more info'><span class='glyphicon glyphicon-info-sign'></span></button>");
    rows.push(row);
  }
  
  var dTableConfig = {
      "columnDefs":
        [
          {
            "searchable": false,
            "targets": [0],
            "title": "index",
            "visible": true
          },
          {
            "searchable": false,
            "targets": [1],
            "title": "MD5",
            "visible": false
          },
          {
            "searchable": true,
            "targets": [2],
            "title": "URL",
            "visible": true
          },
          {
            "searchable": false,
            "targets": [3],
            "title": "Downloads",
            "visible": true
          },
          {
            "searchable": false,
            "targets": [4],
            "title": "Triples",
            "visible": true
          },
          {
            "searchable": false,
            "targets": [5],
            "title": "Metadata",
            "visible": true
          }
        ],
      "data": rows,
      "dom": "frtipS",
      "deferRender": true,
      "createdRow": function ( row, data, index ) {
        var url = $(row).find("td:nth-child(2)").text().trim();
        if (hasArchiveEntry[url]) {
          $(row).find(".downloadClean").attr('disabled', true).css("pointer-events", "auto").attr("title", "This document is an archive. Each separate archive entry is available as cleaned data");
        } else {
          $(row).find(".downloadClean")
            .attr("download", getDownloadName(url))
            .attr("href", api.wardrobe.download(md5[url]));
        }
        if (fromArchive[url]) {
          $(row).find(".downloadDirty").attr('disabled', true)
            .attr("href", "javascript:void(0);")
            .css("pointer-events", "auto")
            .attr("title", "This document is extracted from an archive. If you would want to download the original (dirty) file, download the parent archive")
        }
        $(row).find(".showDatasetInfo").click(function(){
          var url = $(this).closest("tr").find("td:nth-child(2)").text().trim();
          drawDataset(url);
        });
        
        $(row).find("a").click(function(event){event.stopPropagation();});
        $(row).find("button").click(function(event){event.stopPropagation();});
        
        $(this).toggleClass('selected');
        $(row).click(function(){$(this).toggleClass('selected');updateMultiSelectDownloads();});
      },
      "language": {
        "decimal": ",",
        "thousands": "."
      },
      "iDisplayLength": 25,
      "fnDrawCallback": function ( oSettings ) {
        /* Need to redo the counters if filtered or sorted */
        if ( oSettings.bSorted || oSettings.bFiltered ) {
          for ( var i=0, iLen=oSettings.aiDisplay.length ; i<iLen ; i++ )
          {
            $('td:eq(0)', oSettings.aoData[ oSettings.aiDisplay[i] ].nTr ).html( i+1 );
          }
        }
      },
      "scrollX": "100%",
      "scrollY": "800px"
  };
  dataTable = table.dataTable(dTableConfig);
  
  multiButtons =  $("<div id='multiButtons' style='float:left; display:none'></div>");
  $("#wardrobeTable_wrapper").prepend(multiButtons);
  $("<button style='margin-left: 10px;' class='btn btn-primary' title='Download the selected washed and cleaned data'><span class='glyphicon glyphicon-download'></span> Download selected cleaned data</button>")
      .appendTo(multiButtons)
      .click(downloadSelectedCleaned);
  $("<button style='margin-left: 10px;' class='btn btn-primary' title='Download the selected dirty data'><span class='glyphicon glyphicon-download'></span> Download selected dirty data</button>")
      .appendTo(multiButtons)
      .click(downloadSelectedDirty);
  dataTable.on('draw.dt', function () { updateMultiSelectDownloads(); });
};


var wardrobeListingSPARQL =
"PREFIX ll: <http://lodlaundromat.org/vocab#>\n\
SELECT ?md5 ?url ?triples\n\
WHERE {\n\
  ?datadoc ll:url ?url .\n\
  ?datadoc ll:md5 ?md5 .\n\
  OPTIONAL { ?datadoc ll:triples ?triples . }\n\
}\n";

$( document ).ready(function() {
  $.ajax({
    data: {
      "default-graph-uri": sparql.mainGraph,
      query: wardrobeListingSPARQL
    },
    headers: {
      "Accept": "application/sparql-results+json,*/*;q=0.9"
    },
    success: function(data) {
      wardrobeData = data;
      drawTable();
      $("<button type='button' class='btn btn-default sparqlBtn'>SPARQL</button>")
          .css("position", "absolute")
          .css("top", "-40px")
          .css("left", "5px")
          .click(function() { window.open(getSparqlLink(query)); })
          .appendTo($("#wardrobeTable_wrapper"));
    },
    url: sparql.url
  });
});


$(window).on('resize', function () {
  dataTable.fnAdjustColumnSizing();
} );

