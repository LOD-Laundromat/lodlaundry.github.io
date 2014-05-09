$( document ).ready(function() {
	$.get(api.laundryBasket.all, function(data) {
		drawDirtyLaundry(data);
	});
});

var drawDirtyLaundry = function(data) {
	$("#dirtyLaundry").text(data);
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