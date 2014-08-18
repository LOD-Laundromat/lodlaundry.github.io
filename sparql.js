$( document ).ready(function() {
	//There is some text on the HTML which we'll need to fill dynamically from javascript:
	$("#actualEndpoint").text(sparql.url).attr("href", sparql.url);
	
    var yasqe = YASQE(document.getElementById("sparql"), {
    	value: "PREFIX ll: <http://lodlaundromat.org/vocab#>\n"+
		"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"+
		"SELECT DISTINCT ?properties ?classes WHERE {\n"+
		"	{[] a ?classes}\n"+
		"	UNION\n"+
		"	{[] ?properties ?x}\n"+
		"}",
		sparql: {
			namedGraphs: [sparql.mainGraph],
			showQueryButton: true,
			endpoint: sparql.url,
		}
    });
    var yasr = YASR(document.getElementById("results"), {
    	getUsedPrefixes: yasqe.getPrefixesFromQuery
    });
    
    /**
    * Set some of the hooks to link YASR and YASQE
    */
    yasqe.options.sparql.handlers.success =  function(data, textStatus, xhr) {
		yasr.setResponse({response: data, contentType: xhr.getResponseHeader("Content-Type")});
	};
	yasqe.options.sparql.handlers.error = function(xhr, textStatus, errorThrown) {
		yasr.setResponse({exception: textStatus + ": " + errorThrown});
	};
	
	
	
	
});
