var api = {
	wardrobe: {
//		all: "http://lodlaundry.wbeek.ops.few.vu.nl/ll/all.json"
		all: "testInput.json"
	},
	laundryBasket: {
		all: "testLaundryBasket.txt",
		send: "lodlaundry.wbeek.ops.few.vu.nl/ll/newLaundry"
	}
};


drawBackButton = function() {
	$('  <div class="backButton"><button type="button" class="wardrobeLink btn btn-primary btn-lg"><span class="glyphicon glyphicon-arrow-left"></span></button></div>')
		.click(function(){
			window.location = "index.html";
		}).appendTo($("body"));
};



//init loader
$.ajaxSetup({
  beforeSend: function() {
     $('#loader').show();
  },
  complete: function(){
     $('#loader').hide();
  },
  success: function() {}
});


//$( document ).ready(function() {
	//add loader stuff to html
	$("<div id='loader'><img src='imgs/loader.gif'></div>").appendTo($("body"));
//});
//
//var drawDocumentInfo = function(parent, info) {
//	info = {
//			 "base_iri":"http://acm.rkbexplorer.com/id/998550",
//			    "content_length":1997,
//			    "content_type":"application/rdf+xml",
//			    "duplicates":1,
//			    "last_modified":"Sun, 27 Apr 2014 15:29:21 GMT",
//			    "md5":"0c6fe29b6c4b2ed57b779438dacf8587",
//			    "triples":11,
//			    "url":"http://acm.rkbexplorer.com/id/998550"
//	};
//	
//	var table = $("<table></table>");
//	function addRowToTable() {
//		var header = $("<tr></tr>");
//		for (var i = 0; i < arguments.length; i++) {
//			$("<td>" + arguments[i] + "</td>").appendTo(header);
//		}
//		table.append(header);
//	};
//	if (typeof info == "string") {
//		console.log("TODO: fetch info using API");
//		return;
//	}
//	addRowToTable("URI", info.base_iri);
//		
//		
//	$(parent).append(table);
//		
//	
//};
