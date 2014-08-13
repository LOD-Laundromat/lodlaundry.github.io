var hoverDiv;
var wardrobeData = null;
var hasArchiveEntry = {};
var fromArchive = {};
var md5 = {};

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
    }
  } else {
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
//    row.push(results.md5.value);
    row.push(results.url.value + "<div class='md5 hidden'>" + results.md5.value + "</div>");
    row.push(
        "<a class='downloadClean btn btn-default' title='Download the washed and cleaned data' target='_blank'><span class='glyphicon glyphicon-download'></span> Clean</a>" +
        "<a class='downloadDirty btn btn-default' title='Download original dirty dataset' href='" + results.url.value + "' target='_blank'><span class='glyphicon glyphicon-download'></span> Dirty</a>"
    );
    row.push(results.triples ? results.triples.value : 0);
    row.push("<button type='button' class='showDatasetInfo btn btn-default' title='Show more info'><span class='glyphicon glyphicon-info-sign'></span></button>");
    rows.push(row);
  }
  
  var dTableConfig = {
      "autoWidth": "false",
      "columnDefs":
        [
          {
            "celltype": "td",
            "targets": "_all"
          },
//          {
//              "className": "columnMd5",
//              "orderable": false,
//              "searchable": false,
//              "targets": [0],
//              "title": "MD5",
//              "visible": false,
//            },
          {
            "className": "columnUrl",
            //"name": "url",
            "orderable": true,
            "searchable": true,
            "targets": [0],
            "title": "URL",
            //"type": "string",
            "visible": true,
          },
          {
            "className": "columnDownload",
            //"name": "download",
            "orderable": false,
            "searchable": false,
            "targets": [1],
            "title": "Download",
            //"type": "html",
            "visible": true,
            width: "160px"
          },
          {
            "className": "columnTriples",
            "orderable": true,
            "searchable": false,
            "targets": [2],
            "title": "Triples",
            //"type": "numeric",
            "visible": true
          },
          {
            "className": "columnMetadata",
            //"name": "metadata",
            "orderable": false,
            "searchable": false,
            "targets": [3],
            "title": "Metadata",
            //"type": "html",
            "visible": true
          }
        ],
      "createdRow": function (row, data, dataIndex) {
        var md5 = $(row).find(".md5").text();
        var triples = parseInt(data[3]);
        var cleanLink;
        if (triples == 0) {
          cleanLink = "javascript:void(0);";
        } else {
          cleanLink = api.wardrobe.download(md5);
        }
        $(row).find(".downloadClean").attr("href", cleanLink);
        $(row).find(".showDatasetInfo").click(
            function(){
              showMetadataBox(md5);
            }
        );
        $(row).find("a").click(
            function(event){
              event.stopPropagation();
            }
        );
        $(row).find("button").click(
            function(event){
              event.stopPropagation();
            }
        );
        $(this).toggleClass('selected');
        $(row).click(
            function(){
              $(this).toggleClass('selected');
              updateMultiSelectDownloads();
            }
        );
        
        //grrrrr. Somehow, the datatables 'language.thousands' setting does not work. 
        //Fine, then we do it ourselves (fingers crossed we don't break anything...) 
        var triplesTd = $(row).find(".columnTriples");
        triplesTd.text(triplesTd.text().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
      },
      "data": rows,
      "deferRender": true,
      "displayStart": 0,
      "dom": "frtipS",
      "info": true,
      "language": {
        "decimal": ",",
        "thousands": ".",
        "loadingRecords": "Loading wardrobe contents...",
      },
      "lengthChange": true,
      "lengthMenu": [10,50,100,250,500,1000],
      "order": [2,"desc"],
      "ordering": true,
      "paging": true,
      "processing": true,
      "scrollX": false,
      "scrollY": false,
      "searching": true,
      "stateSave": true
  };
  dataTable = table.dataTable(dTableConfig);
  
  multiButtons =  $("<div id='multiButtons' style='float:left; display:none'></div>");
  
  $("#wardrobeTable_wrapper").prepend(multiButtons);
  
  $("<div class='sparqlQueryDiv'><button type='button' class='btn btn-default sparqlBtn'>SPARQL</button></div>")
  .click(function() { window.open(getSparqlLink(sparql.queries.wardrobeListing)); })
  .prependTo($("#wardrobeTable_wrapper"));
  
  
  $("<button style='margin-left: 10px;' class='btn btn-primary' title='Download the selected washed and cleaned data'><span class='glyphicon glyphicon-download'></span> Download selected cleaned data</button>")
      .appendTo(multiButtons)
      .click(downloadSelectedCleaned);
  $("<button style='margin-left: 10px;' class='btn btn-primary' title='Download the selected dirty data'><span class='glyphicon glyphicon-download'></span> Download selected dirty data</button>")
      .appendTo(multiButtons)
      .click(downloadSelectedDirty);
  dataTable.on('draw.dt', function () { updateMultiSelectDownloads(); });
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
      
    },
    url: sparql.url
  });
});


$(window).on('resize', function () {
  dataTable.fnAdjustColumnSizing();
} );

