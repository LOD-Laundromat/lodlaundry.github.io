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
var initHoverIcons = function() {
	hoverDiv = $("<div align='right' class='tableHoverImgs'></div>").hide();
	$("<a download='output.nt.gz'  class='tableHoverItem' id='downloadItem' target='_blank'><img src='imgs/download.png'></img></a>")
		.appendTo(hoverDiv);
	$("<a  class='tableHoverItem'><img src='imgs/info.png' ></img></a>")
	.click(function(){
		var url = $(this).closest("td").text();
		drawDataset(wardrobeData[url]);
	})
	.appendTo(hoverDiv);
	$("body").append(hoverDiv);
};
initHoverIcons();
var showIcons = function() {
	hoverDiv.show();
	$(this).find('td:eq(1)').append(hoverDiv);
	
	var url = hoverDiv.closest("td").text();
	var md5 = wardrobeData[url].md5;
	hoverDiv.find("#downloadItem").attr("href", api.wardrobe.download(md5));
};
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
var dataTable;
var drawTable = function() {
	var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="wardrobeTable"></table>');
	$('#tableWrapper').html(table);
	 
	var rows = [];
	for (var dataKey in wardrobeData) {
		var dataObj = wardrobeData[dataKey];
		var row = [];
		if (!dataObj.url) continue;
//		console.log(dataObj.base_iri);
		row.push("");//this is where the row index comes automatically
		row.push("<a title='Download from original location' href='" + dataObj.url + "' target='_blank'>" + dataObj.url + "</a>");
		row.push(dataObj.rdf && dataObj.rdf.serializationFormat? dataObj.rdf.serializationFormat: "unknown");
//		row.push(dataObj.httpRepsonse && dataObj.httpRepsonse.contentLength? dataObj.httpRepsonse.contentLength: "unknown");
		row.push(dataObj.httpRepsonse && dataObj.httpRepsonse.lastModified? dataObj.httpRepsonse.lastModified: "unknown");
		row.push(dataObj.rdf && dataObj.rdf.duplicates ? dataObj.rdf.duplicates : 0);
		row.push(dataObj.rdf && dataObj.rdf.triples ? dataObj.rdf.triples: null);
		rows.push(row);
	}
	
	
	dataTable = table.dataTable( {
		
        "data": rows,
        "sScrollX": "100%",
        "bAutoWidth": true,
        "iDisplayLength": 20,
        "columns": [
            { "title": "index" },//
            { "title": "URL" },//1
            { "title": "Format" },//2
//            { "title": "Content Length" },//3
            { "title": "Last Modified"},//3
            { "title": "Duplicates"},//4
            { "title": "Triples"}//5
        ],
        "language": {
            "decimal": ",",
            "thousands": "."
        },
        "createdRow": function ( row, data, index ) {
        	$(row).mouseover(showIcons);
        	$(row).mouseout(hideIcons);
        },
        "drawCallback" : function(settings){
        	var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;
 
            api.column(2, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group"><td colspan="5">'+group+'</td></tr>'
                    );
 
                    last = group;
                }
            } );
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
    		{ "bSortable": false, "aTargets": [ 0 ] },
    		{ "sType": "numeric","aTargets": [ 5 ] },
    		{ "sWidth": "30px", "aTargets": [ 0 ] },
    		{ "sWidth": "130px", "aTargets": [ 3 ] },
    	],
    	"aaSorting": [[ 5, 'desc' ]]
    }); 
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
