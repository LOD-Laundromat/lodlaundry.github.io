var api = {
	wardrobe: {
		all: "testInput.json"
	},
	laundryBasket: {
		all: "testLaundryBasket.txt",
		send: "lodlaundry.wbeek.ops.few.vu.nl/ll/newLaundry"
	}
};

var goToMain = function() {
	
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


$( document ).ready(function() {
	//add loader stuff to html
	$("<div id='loader'><img src='imgs/loader.gif'></div>").appendTo($("body"));
});

