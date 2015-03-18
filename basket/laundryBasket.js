var recordsTotal;

//for date presentation
var month_names = new Array ( );
month_names[month_names.length] = "January";
month_names[month_names.length] = "February";
month_names[month_names.length] = "March";
month_names[month_names.length] = "April";
month_names[month_names.length] = "May";
month_names[month_names.length] = "June";
month_names[month_names.length] = "July";
month_names[month_names.length] = "August";
month_names[month_names.length] = "September";
month_names[month_names.length] = "October";
month_names[month_names.length] = "November";
month_names[month_names.length] = "December";




var datatable;
$.ajax({
    data: [
           {name: "default-graph-uri", value: sparql.graphs.main},
           {name: "default-graph-uri", value: sparql.graphs.seedlist},
           {name: "query", value: sparql.queries.totalBasketContents},
    ],
    headers: {
      "Accept": "application/json"
    },
    success: function(data) {
      if (data.results.bindings.length > 0) {
    	  recordsTotal = data.results.bindings[0].total.value;
    	  
    	  
    	  $(document).ready(function() {
		    datatable = $('#tableWrapper table').DataTable( {
		    	autoWidth: false,
		        "processing": true,
		        "serverSide": true,
		        "ajax": $.fn.dataTable.pipeline(),
		        "drawCallback": function ( oSettings ) {
		      	  $('.longtitle').tooltip();
		        },
		        "columns": [
                    {//0 URL
			        	"render": function ( data, type, full, meta ) {
			        		return "<a href='" + data + "' target='blank'>" + data + "</a>";
			        	},
			        	"class": "urlCol",
			        	orderable: false,
		        	},
                    {//1 date added
		        		render: function( xsdDate, type, full, meta ) {
		        			var date = new Date(xsdDate);
		        			var min = date.getUTCMinutes();
		        			var formattedDate = date.getUTCDate() + ' ' + month_names[date.getUTCMonth()] + ' ' + date.getUTCFullYear() + ' ' + date.getUTCHours() + ":" + ((""+min).length == 1? "0": "") + min;
		        	        return '<span title="' + xsdDate + '">' + formattedDate + '</span>';
		        		},
		        		width: 150,
//		        		
		        		orderable: false,
                    },
		        	{//2 status
			        	width: 90,
			        	orderable: false,
			        	"class": "statusCol"
		        	},
		        	{//3 info button
		        		orderable: false,
		        		width: 40
		        	}
		        ]
		    });
		    addFilterWidgets();
//		    datatable.fnFilterOnReturn().css("display", "table");
		} );
    	  
    	  
      }
    },
    url: sparql.url
});

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
        		{name: "query", value: sparql.queries.basketListing(sparql.graphs.main, sparql.graphs.main, request.draw, request.order, request.start, request.length, request.search.value)},
        		{name: "default-graph-uri", value: sparql.graphs.main},
        		{name: "default-graph-uri", value: sparql.graphs.seedlist},
        	];
        },
        method: 'GET' // Ajax HTTP method
    }, opts );
 
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
var doSearch;
var addFilterWidgets = function() {
	/**
	 * statusfilter
	 */
	var select = $("<select id='statusFilter'/>").appendTo($("<div></div>").appendTo($("#statusHeader")));
	$("<option value='-'>---</option>").appendTo(select);
	$("<option value='cleaned'>cleaned</option>").appendTo(select);
	$("<option value='queued'>queued</option>").appendTo(select);

	select.on('change', function() {
		doSearch();
	});
	
	/**
	 * URL filter
	 */
	
	var urlFilter = $('<input id="urlFilter" style="margin-left: 20px;" type="search" placeholder="filter">')
	.keyup(function(event){
	    if(event.keyCode == 13){
	    	doSearch();
	    }
	}).appendTo("#urlHeader");
	
	doSearch = function() {
		var urlFilterVal = urlFilter.val().trim().replace('"', '').replace("'", '');
		var statusFilterVal = select.val().trim();
		var filter = "";
		if (statusFilterVal != "-") {
			filter += "status:" + statusFilterVal;
		}
		if (urlFilterVal.length > 0) {
			filter += (filter.length == 0? "": " ") + urlFilterVal;
		}
		datatable.search(filter).draw();
	};
};

	
var getStatus = function(result) {
	if (result.endClean) {
		return "cleaned";
	} else {
		return "queued";
	}
};

 
// Register an API method that will empty the pipelined data, forcing an Ajax
// fetch on the next draw (i.e. `table.clearPipeline().draw()`)
$.fn.dataTable.Api.register( 'clearPipeline()', function () {
    return this.iterator( 'table', function ( settings ) {
        settings.clearCache = true;
    } );
} );


//?totalFilterCount ?drawId ?datadoc ?url ?dateAdded ?startUnpack ?endUnpack ?startClean ?endClean
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
		row.push(sparqlResult.results.bindings[i].dateAdded.value);
		row.push(getStatus(sparqlResult.results.bindings[i]));
		row.push("<a style='padding: 6px;' class='btn btn-default glyphicon glyphicon-info-sign' title='Show more info' href='" + sparqlResult.results.bindings[i].datadoc.value + "' target='_blank'></a>");
		datatable.data.push(row);
		
	}
	return datatable;
};
var successMsg =
    "<span class=\"label label-success\">Successfully received!</span>";
function storeUrl() {
  var failureMsg = function(customMsg) {
	  var msg = "<span class=\"label label-danger\">";
	  if (customMsg && typeof customMsg == "string" && customMsg.length > 0){
          msg += customMsg + '.';
	  } else if (customMsg && typeof customMsg == 'object' && customMsg.alternative){
	      msg += 'Did you mean <a class="alternativeUrl" style="color:#2C2C2C" href="#">' + customMsg.alternative + '</a>?';
	  }
      else {
		  msg += "Something went wrong. Is the url correct?"; 
	  }
	  msg += " If this problem persists, please drop us a <a style=\"color:#2C2C2C\" href=\"https://github.com/LODLaundry/lodlaundry.github.io/issues\">Github issue</a>!</span>";
	  return msg;
  };
  
  
  var url = $("#newDirtyLaundry").val().trim();
  if (url.length > 0) {
    $.ajax({
      data: {
        url: url
      },
      error: function(response,textStatus,errorThrown) {
    	  var errorThrown = response.responseText || errorThrown;
	      try{
	          errorThrown = JSON.parse(errorThrown);
	      }catch(e){
	          //never mind, it's just a string
	      }
        $(".submitStatus").empty().hide().append(failureMsg(errorThrown)).show(400);
        $(".submitStatus .alternativeUrl").click(function(){
            $("#newDirtyLaundry").val($(this).text());
            storeUrl();
        });
      },
      success: function() {
        $(".submitStatus").empty().hide().append(successMsg).show(400);
        
        //update table as well
        $('#urlFilter').val(url);
        doSearch();
      },
      type: "GET",
      url: api.laundryBasket.seedUpdateApi
    });
  }
}


$(document).ready(function() {
    var button = Dropbox.createChooseButton({success: function(files) {
        if (files.length > 0) {
            var url = files[0].link;
            $.ajax({
                data: {
                  url: url
                },
                error: function(response,textStatus,errorThrown) {
                    $(".submitStatusDropbox").empty().hide().append("<span class=\"label label-danger\">Something went wrong.</span> If this problem persists, please drop us a <a style=\"color:#2C2C2C\" href=\"https://github.com/LODLaundry/lodlaundry.github.io/issues\">Github issue</a>!</span>").show(400);
                },
                success: function() {
                  $(".submitStatusDropbox").empty().hide().append(successMsg).show(400);
                  
                  //update table as well
                  $('#urlFilter').val(url);
                  doSearch();
                },
                type: "GET",
                url: api.laundryBasket.seedUpdateApi
              });
        }
    }});
    document.getElementById("dropboxBtn").appendChild(button);
});
