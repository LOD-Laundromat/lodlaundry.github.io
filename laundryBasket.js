$( document ).ready(function() {
	$.get(api.laundryBasket.all, function(data) {
		drawDirtyLaundry(data);
	});
});

var drawDirtyLaundry = function(data) {
	
	
	var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="laundryBasketTable"></table>');
	$('#tableWrapper').html(table);
	 
	var rows = [];
	for (var dataKey in data) {
		var dataObj = data[dataKey];
		var row = [];
		if (!dataObj.url) continue;
		row.push("");//this is where the row index comes automatically
		var urlCol = dataObj.url + "<div align='right'></div>";
		
		
		row.push(urlCol);
		
		
		
		row.push(dataObj.rdf && dataObj.rdf.serializationFormat? dataObj.rdf.serializationFormat: "unknown");
		row.push(dataObj.httpresponse && dataObj.httpresponse.lastModified? dataObj.httpresponse.lastModified: "unknown");
		row.push(dataObj.rdf && dataObj.rdf.duplicates ? dataObj.rdf.duplicates : 0);
		row.push(dataObj.rdf && dataObj.rdf.triples ? dataObj.rdf.triples: null);
		row.push("a");
		rows.push(row);
	}
	
	var dTableConfig = {
			
	        "data": rows,
	        "sScrollX": "100%",
	        "bAutoWidth": true,
	        "iDisplayLength": 20,
	        "columns": [
	            {  "title": "index", "targets": 0 },//
	            { "title": "URL<br><input type='text' placeholder='Search />", "targets": 1 },//1
	            { "title": "Format", "targets": 2 },//2
//		            { "title": "Content Length" },//3
	            {  "title": "Last Modified", "targets": 3},//3
	            {  "title": "Duplicates", "targets": 4},//4
	            {  "title": "Triples", "targets": 5},//5
	            {  "title": "", "targets": 6}//6 icons
	        ],
	        "language": {
	            "decimal": ",",
	            "thousands": "."
	        },
	        "createdRow": function ( row, data, index ) {
//		        	$(row).mouseover(showIcons);
//		        	$(row).mouseout(hideIcons);
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
	    	    { "bSearchable": true, "aTargets": [ 1,2,3,4,5 ] },
	    		{ "bSortable": false, "aTargets": [ "index" ] },
	    		{ "sType": "numeric","aTargets": [ 4,5 ] },
	    		{ "sWidth": "30px", "aTargets": [0] },
	    		{ "sWidth": "130px", "aTargets": [3 ] },
	    	],
	    	"aaSorting": [[ 5, 'desc' ]]
	    };
	dataTable = table.dataTable(dTableConfig);
	
};

$(".submitDirtyLaundryLink").click(function() {
	var newDirtyLaundry = $("#newDirtyLaundry").val();
	if (newDirtyLaundry.trim().length > 0) {
		
		$.ajax({
			  type: "POST",
			  url: api.laundryBasket.send,
			  data: {"laundry": newDirtyLaundry},
			  success: function() {
//				  loadingFinish();
			  },
			  error: function() {
				  //something went wrong
//				  glyphicon-check
//				  loadingFinish();
			  } 
			});
	}
});