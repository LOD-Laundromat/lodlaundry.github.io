$( document ).ready(function() {
    
	//There is some text on the HTML which we'll need to fill dynamically from javascript:
	$("#actualEndpoint").text(sparql.url).attr("href", sparql.url);
	
	var namedGraphs = getUrlParams("named-graph-uri");
	var defaultGraphs = getUrlParams("default-graph-uri");
	if (defaultGraphs.length == 0) defaultGraphs = [sparql.graphs.main, sparql.graphs.seedlist, sparql.graphs.metrics, sparql.graphs.error, sparql.graphs.http];
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
			defaultGraphs: defaultGraphs,
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
    yasqe.options.sparql.callbacks.complete = yasr.setResponse;
	if (getUrlParams("query").length > 0) yasqe.query();//exec query immediately when someone with link opens page
	
	
	
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

//disable regular lodlaundromat loader behaviour
$.ajaxSetup({
    beforeSend: function() {
     
    },
});