var api = {
	wardrobe: {
//		all: "http://lodlaundry.wbeek.ops.few.vu.nl/ll/all.json"
		all: "testInput.json",
		download: function(md5) {return "http://lodlaundry.wbeek.ops.few.vu.nl/ll/datadocs/" + md5 + "/input.nt.gz";}
	},
	laundryBasket: {
		all: "lod_basket.txt",
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
		var row = $("<tr></tr>").appendTo(table);
		if (config.rowClass) row.addClass(config.rowClass);
		if (config.midHeader) row.css("font-weight", "bold");
		for (var i = 0; i < config.values.length; i++) {
			var col = $("<td></td>");
			if (config.isHeader) col = $("<th></th>");
			if (config.midHeader) col.attr("colspan", "2");
			row.append(col);
			var arg = config.values[i];
			if (typeof arg == "string") {
				col.html(arg);
			} else {
				col.append(arg);
			}
			if (i == 0 && config.indentFirstCol) col.css("padding-left", "15px");
		}
	};
	
	addRow({values: ["URL" , "<a href='" + d.url + "' target='_blank'>" + d.url + "</a>"]});
	addRow({values:["MD5" , d.md5]}); 
	if (d.hasArchiveEntry) {
		addRow({midHeader: true,values:["Archive entries" ]});
		for (var i = 0; i < d.hasArchiveEntry.length; i++) {
			var colContent = $("<a href='" + d.hasArchiveEntry[i] + "' target='_blank'>" + d.hasArchiveEntry[i] + "</a>");
			addRow({values:["", colContent ]});
		}
	}
	if (d.fromArchive) {
		var colContent = $("<a href='" + d.fromArchive + "' target='_blank'>" + d.fromArchive + "</a>");
		addRow({values:["Unpacked from archive" , colContent]}); 
	}
	if (d.archiveEntrySize) {
		addRow({values:["Size of archive entry" , d.archiveEntrySize]}); 
	}
	if (d.fileExtension) {
		addRow({values:["File extension" , d.fileExtension]}); 
	}
	if (d.rdf) {
		addRow({midHeader: true,values:["Parsed RDF info" ]});
		addRow({indentFirstCol: true, values:["<i>#triples</i>", d.rdf.triples ]});
		addRow({indentFirstCol: true, values:["<i>#Duplicates</i>", d.rdf.duplicates ]});
		addRow({indentFirstCol: true, values:["<i>Serialization Format</i>", d.rdf.serializationFormat ]});
		if (d.rdf.syntaxErrors) {
			var firstCol = "<i>Syntax errors</i>";
			for (var i = 0; i < d.rdf.syntaxErrors.length; i++) {
				addRow({indentFirstCol: true, rowClass: "warning", values:[firstCol, d.rdf.syntaxErrors[i]]});
				firstCol = "";
			}
		}
	}
	if (d.httpresponse) {
		addRow({midHeader: true, values:["HTTP Response" ]}); 
		var contentLength = d.httpresponse.contentLength || "unknown";
		addRow({indentFirstCol: true, values:["<i>Content Length</i>", contentLength ]});
		var contentType = d.httpresponse.contentType || "unknown";
		addRow({indentFirstCol: true, values:["<i>Content Type</i>", contentType ]});
		var lastModified = d.httpresponse.lastModified || "unknown";
		addRow({indentFirstCol: true, values:["<i>Last Modified</i>", lastModified ]});
	}
	
	if (d.stream) {
		addRow({midHeader: true,values:["File stream info (unpacked)" ]});
		addRow({indentFirstCol: true, values:["<i>Byte Count</i>", d.stream.byteCount ]});
		addRow({indentFirstCol: true, values:["<i>Char Count</i>", d.stream.charCount ]});
		addRow({indentFirstCol: true, values:["<i>Line Count</i>", d.stream.lineCount ]});
	}
	
	if (d.exceptions) {
		addRow({midHeader: true, rowClass: "danger", values: ["<strong>Exceptions</strong>"]});
		for (var exception in  d.exceptions) {
			var exceptionContent = d.exceptions[exception];
			if (typeof exceptionContent == "array") {
				for (var i = 0; i < exceptionContent.length; i++) {
					addRow({indentFirstCol: true, rowClass: "danger", values: ["<i>" + exeption + "</i>", exceptionContent[i]]});
				}
			} else {
				addRow({indentFirstCol: true, rowClass: "danger", values: ["<i>" + exception + "</i>", exceptionContent]});
			}
			
		}
	}
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