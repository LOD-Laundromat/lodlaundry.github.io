$( document ).ready(function() {
	$.get(api.laundryBasket.all, function(data) {
		drawDirtyLaundry(data);
	});
});

var drawDirtyLaundry = function(data) {
	data = data.split("\n");
	var table = $('<table cellpadding="0" cellspacing="0" border="0" class="display" id="laundryBasketTable"></table>');
	$('#tableWrapper').html(table);
	
	var rows = [];
	for (var i = 0; i < data.length; i++) {
		if (data[i].length == 0) continue;
		var row = [];
		row.push("");//this is where the row index comes automatically
		row.push(data[i]); //seed
		row.push(""); //added
		row.push("");//last crawled
		rows.push(row);
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
//		        	$(row).mouseover(showIcons);
//		        	$(row).mouseout(hideIcons);
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
	    	    { "bSearchable": true, "aTargets": [ 1,2,3 ] },
	    		{ "bSortable": false, "aTargets": [ 0 ] },
	    		{ "sWidth": "30px", "aTargets": [0] },
	    	],
	    	"aaSorting": [[ 2, 'desc' ]]
	    };
	dataTable = table.dataTable(dTableConfig);
	
};

$("#newDirtyLaundry").keyup(function() {
	$(".submitStatus").hide(400);
});
$(".submitDirtyLaundryLink").click(function() {
	var success = "<span class=\"label label-success\">Successfully received. Pffff, that dirty data smells!</span>";
	var fail = "<span class=\"label label-danger\">Something went wrong... Is the url correct? If this problem persists, let us know via github!</span>";
	var newDirtyLaundry = $("#newDirtyLaundry").val().trim();
	if (newDirtyLaundry.length > 0) {
		$.ajax({
			  type: "GET",
			  url: api.laundryBasket.send,
			  data: {url: newDirtyLaundry},
			  success: function() {
				  $(".submitStatus").empty().hide().append(success).show(400);
			  },
			  error: function() {
				  $(".submitStatus").empty().hide().append(fail).show(400);
			  } 
			});
	}
});