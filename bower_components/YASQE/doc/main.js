$ = jQuery = require("jquery");

require("../node_modules/twitter-bootstrap-3.0.0/dist/js/bootstrap.js");



$(function() {
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 400);
        return false;
      }
    }
  });
});


$(document).ready(function() {
	//get the latest hosted version
	if ($("#cdnDownload").length > 0) {
		//only draw when we've got some place to print this info (might not be on all pages where we include this js file)
		$.get("http://api.jsdelivr.com/v1/jsdelivr/libraries?name=yasqe&fields=lastversion", function(data) {
			if (data.length > 0) {
				var version = data[0].lastversion;
				$("#yasqeCss").text("<link href='//cdn.jsdelivr.net/yasqe/" + version + "/yasqe.min.css' rel='stylesheet' type='text/css'/>");
				$("#yasqeJsBundled").text("<script src='//cdn.jsdelivr.net/yasqe/" + version + "/yasqe.bundled.min.js'></script" + ">");
				$("#yasqeJs").text("<script src='//cdn.jsdelivr.net/yasqe/" + version + "/yasqe.min.js'></script" + ">");
			} else {
				console.log("failed accessing jsdelivr api");
				$("#cdnDownload").hide();
			}
		}).fail(function() {
			console.log("failed accessing jsdelivr api");
			$("#cdnDownload").hide();
		});
	}
	var gistContainer = $("#gistContainer");
	if (gistContainer.length > 0) {
		$.get("https://api.github.com/users/LaurensRietveld/gists", function(data) {
			var processLabel = function(origLabel) {
				var label = origLabel.replace("#YASQE", "YASQE");
				label = label.replace("#YASR", "YASR");
				var splitted = label.split(" ");
				if (splitted.length > 0) {
					if ((splitted[0].indexOf("YASQE") == 0 || splitted[0].indexOf("YASR") == 0) && splitted[0].slice(-1) == ":") {
						//we want to change "#YASQE: some gist" into "some gist". So, remove the first item
						return splitted.splice(1).join(" ");
					} else {
						return splitted.join(" ");
					}
				} else {
					return label;
				}
			};
			data.forEach(function(gist) {
				if (gist.description.indexOf("#YASQE") >= 0) {
					var gistDiv = $("<div>").addClass("gist").appendTo(gistContainer);
					$("<h4>").text(processLabel(gist.description)).appendTo(gistDiv);
					if (gist.files["README.md"]) {
						var description = $("<p>").appendTo(gistDiv);
						$.get(gist.url, function(gistFile) {
							description.text(gistFile.files["README.md"].content);
						});
					}
					var buttonContainer = $("<p>").appendTo(gistDiv);
					$("<a class='btn btn-primary btn-sm' target='_blank' href='#' role='button'>Demo</a>").attr('href', 'http://bl.ocks.org/LaurensRietveld/raw/' + gist.id).appendTo(buttonContainer);
					$("<a style='margin-left: 4px;' target='_blank' class='btn btn-default btn-sm' href='#' role='button'>Code <img class='pull-right gistIcon' src='imgs/blacktocat_black.png'></a>").attr('href', gist["html_url"]).appendTo(buttonContainer);
				}
			});
		});
		
		
//		<div class="gist">
//		<h4>LABELLL</h4>
//		<p>description</p>
// 		<p><a class="btn btn-primary btn-sm" href="#" role="button">Demo</a> <a class="btn btn-default btn-sm" href="#" role="button">Code <img class="pull-right gistIcon" src="imgs/blacktocat_black.png"></a></p>
//		</div>
		
	}
});

