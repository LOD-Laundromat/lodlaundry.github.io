var recordsTotal;

$.ajax({
    data: [
           {name: "default-graph-uri", value: sparql.graphs.main},
           {name: "default-graph-uri", value: sparql.graphs.seedlist},
           {name: "query", value: sparql.queries.totalWardrobeContents},
    ],
    headers: {
      "Accept": "application/json"
    },
    success: function(data) {
      if (data.results.bindings.length > 0) {
    	  recordsTotal = data.results.bindings[0].total.value;
    	  
    	  
    	  $(document).ready(function() {
		    var datatable = $('#wardrobeTable').dataTable( {
		        "processing": true,
		        "serverSide": true,
		        "ajax": $.fn.dataTable.pipeline(),
		        "drawCallback": function ( oSettings ) {
		      	  $('.longtitle').tooltip();
		        },
		        createdRow: function(row, data, dataIndex) {
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
		        },
		        "columns": [
                    {//0 URL
                    	"class": "urlCol"
		        	},
                    {//1 buttons/url
		        		render: function( data, type, full, meta ) {
		        			var cleanBtn;
		        			if (full[2]) {
		        				//we have a clean file (as we have triples)
		        				cleanBtn = "<a class='downloadClean btn btn-default' download='" + $('<a>').prop('href', full[0]).prop('hostname') + ".clean.nt.gz' href='"+ api.wardrobe.download(full[3]) + "' title='Download the washed and cleaned data' target='_blank'><span class='glyphicon glyphicon-download'></span> Clean</a>";
		        			} else {
		        				cleanBtn = "<a class='downloadClean btn btn-default disabled' href='javascript:void(0)' title='Cleaned file not available'><span class='glyphicon glyphicon-download'></span> Clean</a>";
		        			}
		        			var dirtyBtn;
		        	        if (true) {
		        	        	dirtyBtn = "<a class='downloadDirty btn btn-default' title='Download original dirty dataset' href='" + full[0] + "' target='_blank'><span class='glyphicon glyphicon-download'></span> Dirty</a>"; 
		        	        }
		        	        return cleanBtn + dirtyBtn;
		        		},
		        		width: 160,
		        		"class": "buttonCol",
		        		orderable: false
                    },
		        	{//2 triples
                    	"render": function ( count ) {
                    		if (count && count.length) {
                    			return ("" + count).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, function($1) { return $1 + "." ;});//add thousands separator
                    		} else {
                    			return "N/A";
                    		}
//			        		return "<span class='longtitle' data-toggle='tooltip' data-placement='top' title='" + oObj + "'>" + shortenUrl(oObj) + "</span>";
                    		
			        	},
			        	"class": "tripleCol",
			        	width: 90
		        	},
		        	{//3 md5
		        		visible: false,
		        	},
		        	{//4 info button
		        		orderable: false,
		        		width: 40
		        	}
		        ]
		    }).fnFilterOnReturn().css("display", "table");
		    $("#wardrobeTable_wrapper").prepend(multiButtons);
		    datatable.on('draw.dt', function () { updateMultiSelectDownloads(); });
		} );
    	  
    	  
      }
    },
    url: sparql.url
});

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


var multiButtons =  $("<div id='multiButtons' style='float:left; display:none'></div>");
$("<button style='margin-left: 10px;' class='btn btn-primary' title='Download the selected washed and cleaned data'><span class='glyphicon glyphicon-download'></span> Download selected cleaned data</button>")
.appendTo(multiButtons)
.click(downloadSelectedCleaned);
$("<button style='margin-left: 10px;' class='btn btn-primary' title='Download the selected dirty data'><span class='glyphicon glyphicon-download'></span> Download selected dirty data</button>")
.appendTo(multiButtons)
.click(downloadSelectedDirty);

var updateMultiSelectDownloads = function(url) {
	  if ($("#wardrobeTable tr.selected").length > 0) {
	    if (!multiButtons.is(':visible')) {
	      multiButtons.slideDown();
	    }
	  } else {
	    if (multiButtons.is(':visible')) multiButtons.slideUp();
	  }
	  
	};
//
// Pipelining function for DataTables. To be used to the `ajax` option of DataTables
//
$.fn.dataTable.pipeline = function ( opts ) {
    // Configuration options
    var conf = $.extend( {
        pages: 5,     // number of pages to cache
        url: sparql.url,      // script url
        data: function(request) {
        	return [
        		{name: "query", value:  sparql.queries.wardrobeListing(request.draw, request.order, request.start, request.length, request.search.value)},
        		{name: "default-graph-uri", value: sparql.graphs.main},
        		{name: "default-graph-uri", value: sparql.graphs.seedlist},
        	];
        },
        method: 'GET' // Ajax HTTP method
    }, opts );
//    console.log(opts);
 
    // Private variables for storing the cache
    var cacheLower = -1;
    var cacheUpper = null;
    var cacheLastRequest = null;
    var cacheLastJson = null;
 
    return function ( request, drawCallback, settings ) {
//    	console.log(request);
        var ajax          = false;
        var requestStart  = request.start;
        var drawStart     = request.start;
        var requestLength = request.length;
        var requestEnd    = requestStart + requestLength;
         
        if ( settings.clearCache ) {
            // API requested that the cache be cleared
            ajax = true;
            settings.clearCache = false;
        }
        else if ( cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper ) {
            // outside cached data - need to make a request
            ajax = true;
        }
        else if ( JSON.stringify( request.order )   !== JSON.stringify( cacheLastRequest.order ) ||
                  JSON.stringify( request.columns ) !== JSON.stringify( cacheLastRequest.columns ) ||
                  JSON.stringify( request.search )  !== JSON.stringify( cacheLastRequest.search )
        ) {
            // properties changed (ordering, columns, searching)
            ajax = true;
        }
         
        // Store the request for checking next time around
        cacheLastRequest = $.extend( true, {}, request );
 
        if ( ajax ) {
            // Need data from the server
            if ( requestStart < cacheLower ) {
                requestStart = requestStart - (requestLength*(conf.pages-1));
 
                if ( requestStart < 0 ) {
                    requestStart = 0;
                }
            }
             
            cacheLower = requestStart;
            cacheUpper = requestStart + (requestLength * conf.pages);
 
            request.start = requestStart;
            request.length = requestLength*conf.pages;
 
            // Provide the same `data` options as DataTables.
            if ( $.isFunction ( conf.data ) ) {
                // As a function it is executed with the data object as an arg
                // for manipulation. If an object is returned, it is used as the
                // data object to submit
                var d = conf.data( request );
                if ( d ) {
                    request = d;
                }
            }
            else if ( $.isPlainObject( conf.data ) ) {
                // As an object, the data given extends the default
                $.extend( request, conf.data );
            }
 
            settings.jqXHR = $.ajax( {
                "type":     conf.method,
                "url":      conf.url,
                "data":     request,
                "dataType": "json",
                "cache":    false,
                "success":  function ( sparqlResult ) {
                	var json = sparqlResultToDataTable(sparqlResult);
                    cacheLastJson = $.extend(true, {}, json);
                    
                    if ( cacheLower != drawStart ) {
                        json.data.splice( 0, drawStart-cacheLower );
                    }
                    json.data.splice( requestLength, json.data.length );
                     
                    drawCallback( json );
                }
            } );
        }
        else {
            json = $.extend( true, {}, cacheLastJson );
            json.draw = request.draw; // Update the echo for each response
            json.data.splice( 0, requestStart-cacheLower );
            json.data.splice( requestLength, json.data.length );
 
            drawCallback(json);
        }
    };
};
 
// Register an API method that will empty the pipelined data, forcing an Ajax
// fetch on the next draw (i.e. `table.clearPipeline().draw()`)
$.fn.dataTable.Api.register( 'clearPipeline()', function () {
    return this.iterator( 'table', function ( settings ) {
        settings.clearCache = true;
    } );
} );

var sparqlResultToDataTable = function(sparqlResult) {
	var datatable = {
		recordsTotal: recordsTotal,
		data: [],
		
	};
	for (var i = 0; i < sparqlResult.results.bindings.length; i++) {
		var row = [];
		datatable.draw = sparqlResult.results.bindings[i].drawId.value;//same for all results though
		datatable.recordsFiltered = sparqlResult.results.bindings[i].totalFilterCount.value;//same for all results though
		
		//while we are at it, do some post processing as well
		row.push(sparqlResult.results.bindings[i].url.value);
		row.push(null);
		var triples = null;
		if (sparqlResult.results.bindings[i].triples && sparqlResult.results.bindings[i].triples.value) {
			triples = sparqlResult.results.bindings[i].triples.value;
		}
		row.push(triples);
		var md5 = sparqlResult.results.bindings[i].md5.value;
		row.push(md5);
		row.push("<a style='padding: 6px;' class='btn btn-default glyphicon glyphicon-info-sign' title='Show more info' href='http://lodlaundromat.org/resource/" + md5 + "' target='_blank'></a>");
		datatable.data.push(row);
		
	}
	return datatable;
};

var getHostname = function(url) {
    var m = url.match(/^http:\/\/[^/]+/);
    return m ? m[0] : null;
};
