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
  
  var rows = [];
  if (!wardrobeData || !wardrobeData.results || !wardrobeData.results.bindings) {
    return;
  }
  
  for (var i = 0; i < wardrobeData.results.bindings.length; i++) {
    var results = wardrobeData.results.bindings[i];
//    var dataObj = wardrobeData[dataKey];
    var row = [];
    
    if (results.parentArchive) {
      hasArchiveEntry[results.parentArchive.value] = true;
      fromArchive[results.url.value] = true;
    }
    md5[results.url.value] = results.md5.value;
    
    row.push("");//this is where the row index comes automatically
    var urlCol = results.url.value + "<div align='right'></div>";
    row.push(urlCol);
    
    
    
    row.push(results.serializationFormat? results.serializationFormat.value: "unknown");
    row.push(results.lastModified? results.lastModified.value: "unknown");
    row.push(results.duplicates?results.duplicates.value: 0);
    row.push(results.triples ? results.triples.value: null);
    row.push("<a class='downloadClean btn btn-default' title='Download the washed and cleaned data' target='_blank'><span class='glyphicon glyphicon-download'></span> Clean</a>&nbsp;" +
        "<a class='downloadDirty btn btn-default' title='Download original dirty dataset' href='" + results.url.value + "' target='_blank'><span class='glyphicon glyphicon-download'></span> Dirty</a>"
    );
    row.push("<button type='button' class='showDatasetInfo btn btn-default' title='Show more info'><span class='glyphicon glyphicon-info-sign'></span></button>");
    rows.push(row);
  }
  
  var dTableConfig = {
      
          "data": rows,
          "sScrollX": "100%",
          "bAutoWidth": true,
          "iDisplayLength": 25,
          "columns": [
                      
              { "title": "index"},//
              { "title": "URL"},//1
              { "title": "Original Format" },//2
              {  "title": "Last Modified"},//3
              {  "title": "Duplicates"},//4
              {  "title": "Triples"},//5
              {  "title": "Downloads", "targets": 6},//6 download icons
              {  "title": "", "targets": 7}//7 info icon
          ],
          "language": {
              "decimal": ",",
              "thousands": "."
          },
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

        "aoColumnDefs": [
            { "bSearchable": true, "aTargets": [ 1,2,3,4,5 ] },
          { "bSortable": false, "aTargets": [ 0, 6, 7 ] },
          { "sType": "numeric","aTargets": [ 4,5 ] },
          { "sWidth": "30px", "aTargets": [0] },
          
          { "sWidth": "140px", "aTargets": [6 ] },
          { "sWidth": "30px", "aTargets": [7 ] },
          { "sWidth": "130px", "aTargets": [3 ] },
        ],
        "aaSorting": [[ 5, 'desc' ]]
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
   
   
  dataTable.on( 'draw.dt', function () {
    updateMultiSelectDownloads();
  } );
   
};


$( document ).ready(function() {
  $.ajax({
    data: {
      "default-graph-uri": sparql.mainGraph,
      query: sparql.queries.wardrobeListing
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
        .click(function() {
          window.open(getSparqlLink(query));
        })
        .appendTo($("#wardrobeTable_wrapper"));
    },
    url: sparql.url
  });
});


$(window).on('resize', function () {
  dataTable.fnAdjustColumnSizing();
} );
