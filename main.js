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
var formatNumber = d3.format(",n");

var goToHash = function(){
	if(window.location.hash) {
		
		$.scrollTo($(window.location.hash), { duration: 500});
	}
};
$(document).ready(function(){ 
	
});




var modalDiv = $("<div class='modal fade'  tabindex='-1' role='dialog' aria-hidden='true'></div>")
.html('<div class="modal-dialog">' +
'  <div class="modal-content">' +
'    <div class="modal-header">' +
'    </div>' +
'    <div class="modal-body">' +
'      <p>One fine body&hellip;</p>' +
'    </div>' +
'    <div class="modal-footer"></div>' + 
'  </div><!-- /.modal-content -->' +
'</div><!-- /.modal-dialog -->')
.appendTo($("body"));
var modal = modalDiv.modal({show: false});


/**
 * config {
 *  header: null, string, or jquery el
 *  content: string (text) or jquery el
 *  footer: null, string(html), or jquery el
 * 
 * }
 */
var drawModal = function(config) {
	//Draw header
	var header = modalDiv.find(".modal-header");
	if (!config.header) {
		if (header.length > 0) modalDiv.find(".modal-header").remove();
	} else {
		if (header.length == 0) header = $("<div class='modal-header'></div>").prependTo(modalDiv.find(".modal-content"));
		if (typeof config.header == "string") {
			modalDiv.find(".modal-header").html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
				'<h4 class="modal-title">' + config.header + '</h4>');
		} else {
			modalDiv.find(".modal-header").empty().append(config.header);
		}
	}
	
	//Draw content
	if (typeof config.content == "string") {
		modalDiv.find(".modal-body").text(config.content);
	} else {
		modalDiv.find(".modal-body").empty().append(config.content);
	}
	
	var footer = modalDiv.find(".modal-footer");
	//draw footer
	if (!config.footer) {
		if (footer.length > 0) modalDiv.find(".modal-footer").remove();
	} else {
		if (footer.length == 0) footer = $(' <div class="modal-footer"></div>').appendTo(modalDiv.find(".modal-content"));
		if (typeof config.footer == "string") {
			modalDiv.find(".modal-footer").html(config.footer);
		} else {
			modalDiv.find(".modal-footer").empty().append(config.footer);
		}
	}
	
	modal.modal("show");
};


var drawDataset = function(d) {
	var table = $("<table class='table'></table>");
	var addRow = function(config) {
		//unlimited args. possible first arg: boolean (this is a header row)
		var row = $("<tr></tr>").appendTo(table);
		for (var i = 0; i < config.values.length; i++) {
			var col = $("<td></td>");
			if (config.isHeader) col = $("<th></th>");
			row.append(col);
			var arg = config.values[i];
			if (typeof arg == "string") {
				col.html(arg);
			} else {
				col.append(arg);
			}
		}
	};
	
	addRow({isHeader: true, values: ["URL" , "<a href='" + d.url + "' target='_blank'>" + d.url + "</a>"]});
	addRow({values:["MD5" , d.md5]}); 
//    "exceptions": {"tcp": ["Host not found" ]},
//    "md5":"5af93b73d12ecfa254941d49855c6bff",
//    "url":"http://%20http://commondatastorage.googleapis.com/m-lab/"
	
	drawModal({header: "Dataset Properties", content: table});
};
var deleteEveryDivExcept = function(divId) {
	$("div").hide();
	$("h1").hide();
	$("h2").hide();
	$("h3").hide();
	var targetDiv = $("#" + divId);
	targetDiv.parents().show();
	targetDiv.show();
};