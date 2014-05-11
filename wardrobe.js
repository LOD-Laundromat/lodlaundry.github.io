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



$( document ).ready(function() {
	$.get(api.wardrobe.all, function(data) {
		drawTable(data.results);
	});
});

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
var drawTable = function(data) {
	var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="wardrobeTable"></table>');
	$('#tableWrapper').html(table);
	 
	var rows = [];
	for (var dataKey in data) {
		var dataObj = data[dataKey];
		var row = [];
		if (!dataObj.url) continue;
//		console.log(dataObj.base_iri);
		row.push("");//this is where the row index comes automatically
		row.push(dataObj.url);
		row.push(dataObj.httpRepsonse && dataObj.httpRepsonse.contentType? dataObj.httpRepsonse.contentType: "unknown");
		row.push(dataObj.httpRepsonse && dataObj.httpRepsonse.contentLength? dataObj.httpRepsonse.contentLength: "unknown");
		row.push(dataObj.httpRepsonse && dataObj.httpRepsonse.lastModified? dataObj.httpRepsonse.lastModified: "unknown");
		row.push(dataObj.rdf && dataObj.rdf.duplicates ? dataObj.rdf.duplicates : "unknown");
		row.push(dataObj.rdf && dataObj.rdf.triples ? dataObj.rdf.triples: null);
		rows.push(row);
	}
	
	
	dataTable = table.dataTable( {
		
        "data": rows,
        "bAutoWidth": false,
        "iDisplayLength": 20,
//        "aoColumns": [{"sWidth":"30px"},{"sWidth":"200px"},{"sWidth":"100px"},{"sWidth":"100px"},{"sWidth":"100px"},{"sWidth":"100px"},{"sWidth":"100px"}],
        "columns": [
            { "title": "index" },//
            { "title": "URL" },//1
            { "title": "Content Type" },//2
            { "title": "Content Length" },//3
            { "title": "Last Modified"},//4
            { "title": "Duplicates"},//5
            { "title": "Triples"}//6
        ],
//        columnDefs: [
//         { type: 'formatted-num', targets: 5 }
//       ],
        "language": {
            "decimal": ",",
            "thousands": "."
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
//    		{ "sWidth": "100px", "aTargets": [ 2,3,4,5,6 ] },
    		{ "sWidth": "30px", "aTargets": [ 0 ] },
    		{ "sWidth": "160px", "aTargets": [ 2] },
    		{ "sWidth": "130px", "aTargets": [ 3 ] },
    		{ "sWidth": "210px", "aTargets": [ 4 ] },
    		{ "sWidth": "110px", "aTargets": [ 5,6 ] },
    	],
    	"aaSorting": [[ 6, 'desc' ]]
    }); 
	console.log(data);
};

