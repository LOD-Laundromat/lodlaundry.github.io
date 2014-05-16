//jQuery.extend( jQuery.fn.dataTableExt.oSort, {
//	"formatted_numbers-pre": function ( a ) {
//        a = (a==="-") ? 0 : a.replace( /[^\d\-\.]/g, "" );
//        return parseFloat( a );
//    },
//
//    "formatted_numbers-asc": function ( a, b ) {
//        return a - b;
//    },
//
//    "formatted_numbers-desc": function ( a, b ) {
//        return b - a;
//    }
//} );
var hoverDiv;
var wardrobeData = null;
//var initHoverIcons = function() {
//	hoverDiv = $("<div align='right' class='tableHoverImgs'></div>").hide();
//	$("<a download='output.nt.gz'  class='tableHoverItem' id='downloadItem' target='_blank'><img src='imgs/download.png'></img></a>")
//		.appendTo(hoverDiv);
//	$("<a  class='tableHoverItem'><img src='imgs/info.png' ></img></a>")
//	.click(function(){
//		var url = $(this).closest("td").text();
//		drawDataset(wardrobeData[url]);
//	})
//	.appendTo(hoverDiv);
//	$("body").append(hoverDiv);
//};
//initHoverIcons();
//var showIcons = function() {
//	hoverDiv.show();
//	$(this).find('td:eq(1)').append(hoverDiv);
//	
//	var url = hoverDiv.closest("td").text();
//	var md5 = wardrobeData[url].md5;
//	hoverDiv.find("#downloadItem").attr("href", api.wardrobe.download(md5));
//};
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
var dataTable;
var drawTable = function() {
	var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="wardrobeTable"></table>');
	$('#tableWrapper').html(table);
	 
	var rows = [];
	for (var dataKey in wardrobeData) {
		var dataObj = wardrobeData[dataKey];
		var row = [];
		if (!dataObj.url) continue;
		row.push("");//this is where the row index comes automatically
		var urlCol = dataObj.url + "<div align='right'></div>";
		
		
		row.push(urlCol);
		
		
		
		row.push(dataObj.rdf && dataObj.rdf.serializationFormat? dataObj.rdf.serializationFormat: "unknown");
		row.push(dataObj.httpresponse && dataObj.httpresponse.lastModified? dataObj.httpresponse.lastModified: "unknown");
		row.push(dataObj.rdf && dataObj.rdf.duplicates ? dataObj.rdf.duplicates : 0);
		row.push(dataObj.rdf && dataObj.rdf.triples ? dataObj.rdf.triples: null);
		row.push("<a class='downloadClean btn btn-default' title='Download the washed and cleaned data' target='_blank'><span class='glyphicon glyphicon-download'></span> Clean</a>&nbsp;" +
				"<a class='downloadDirty btn btn-default' title='Download original dirty dataset' href='" + dataObj.url + "' target='_blank'><span class='glyphicon glyphicon-download'></span> Dirty</a>"
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
	            { "title": "Format" },//2
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
	        	var d = wardrobeData[url];
	        	
	        	if (d.hasArchiveEntry) {
	        		$(row).find(".downloadClean").attr('disabled', true).css("pointer-events", "auto").attr("title", "This document is an archive. Each separate archive entry is available as cleaned data");
	        	} else if (!d.rdf) {
	        		$(row).find(".downloadClean").attr('disabled', true).css("pointer-events", "auto").attr("title", "Failed to clean this document!");
	        	} else {
		        	$(row).find(".downloadClean")
		        		.attr("download", getDownloadName(url))
		        		.attr("href", api.wardrobe.download(d.md5));
	        	}
	        	if (d.fromArchive) {
	        		$(row).find(".downloadDirty").attr('disabled', true)
	        			.attr("href", "javascript:void(0);")
	        			.css("pointer-events", "auto")
	        			.attr("title", "This document come from an archive. If you would want to download the original (dirty) file, download the parent archive")
	        	}
	        	$(row).find(".showDatasetInfo").click(function(){
	        		var url = $(this).closest("tr").find("td:nth-child(2)").text().trim();
	        		drawDataset(wardrobeData[url]);
	        	});
	        },
	        "drawCallback" : function(settings){
//	        	var api = this.api();
//	            var rows = api.rows( {page:'current'} ).nodes();
//	            var last=null;
//	 
//	            api.column(2, {page:'current'} ).data().each( function ( group, i ) {
//	                if ( last !== group ) {
//	                    $(rows).eq( i ).before(
//	                        '<tr class="group"><td colspan="5">'+group+'</td></tr>'
//	                    );
//	 
//	                    last = group;
//	                }
//	            } );
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
//	    	    { 
//	    	    	fnRender: function (o, v) {   // o, v contains the object and value for the column
//		    	        return '<input type="checkbox" id="someCheckbox" name="someCheckbox" />';
//		    	    },
//		    	    aTargets: [0]
//	    	    },
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
};


$( document ).ready(function() {
	$.get(api.wardrobe.all, function(data) {
		wardrobeData = data.results;
		drawTable();
	});
});


$(window).on('resize', function () {
  dataTable.fnAdjustColumnSizing();
} );
