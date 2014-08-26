$( document ).ready(function() {
	//There is some text on the HTML which we'll need to fill dynamically from javascript:
	$("#actualEndpoint").text(sparql.url).attr("href", sparql.url);
	
	var namedGraphs = getUrlParams("named-graph-uri");
	if (namedGraphs.length == 0) namedGraphs = [sparql.mainGraph, sparql.basketGraph];
    var yasqe = YASQE(document.getElementById("sparql"), {
    	value: "PREFIX ll: <http://lodlaundromat.org/vocab#>\n"+
		"PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"+
		"SELECT DISTINCT ?properties ?classes WHERE {\n"+
		"	{[] a ?classes}\n"+
		"	UNION\n"+
		"	{[] ?properties ?x}\n"+
		"}",
		sparql: {
			namedGraphs: namedGraphs,
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
var getUrlParams = function(key) {
	var values = [];
    var pageUrl = window.location.search.substring(1);
    var chunks = pageUrl.split('&');
    for (var i = 0; i < chunks.length; i++) {
        var paramName = chunks[i].split('=');
        if (paramName[0] == key) {
        	values.push(decodeURIComponent(paramName[1]));
        }
    }
    return values;
};