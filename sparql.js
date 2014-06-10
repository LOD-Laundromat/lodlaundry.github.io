$( document ).ready(function() {
	var yasr = YASR(document.getElementById("results"));
	
	YASQE(document.getElementById("sparql"), {
		
		sparql: {
			showQueryButton: true,
			endpoint: "http://virtuoso.lodlaundromat.ops.few.vu.nl/sparql",
			handlers: {
				error: function(xhr, textStatus, errorThrown) {
					yasr.setResponse({exception: textStatus + ": " + errorThrown});
				},
				success: function(data, textStatus, xhr) {
					yasr.setResponse({response: data, contentType: xhr.getResponseHeader("Content-Type")});
				}
			}
		}
	});
	
	
});
