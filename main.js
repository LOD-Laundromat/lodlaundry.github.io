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


$("<div id='loader'><img src='imgs/loader.gif'></div>").appendTo($("body"));


/**
 * helpers
 * 
 */
var formatPercentage = d3.format("%");
var formatThousands = d3.format(",g");
var formatLargeShortForm = d3.format(".2s");

var goToHash = function(){
	if(window.location.hash) {
		
		$.scrollTo($(window.location.hash), { duration: 500});
	}
};
$(document).ready(function(){ 
	
});

var deleteEveryDivExcept = function(divId) {
	$("div").hide();
	$("h1").hide();
	$("h2").hide();
	$("h3").hide();
	var targetDiv = $("#" + divId);
	targetDiv.parents().show();
	targetDiv.show();
};