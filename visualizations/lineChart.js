function drawLineChart(config) {
	var y = {
		degree: [],
		indegree: [],
		outdegree: []
	};
	var x = [];
	for (var i = 0; i < config.data.length; i++) {
		x.push(i);
		var bindings = config.data[i];
		if (bindings.outDegree && bindings.inDegree && bindings.degree) {
			y.outdegree.push(config.data[i].outDegree.value);
			y.indegree.push(config.data[i].inDegree.value);
			y.degree.push(config.data[i].degree.value);
		}
	}
	for (var type in y) y[type].sort(function(a,b) {return b - a;});
	
	var data = [ 
	            { label: "Degree", 
	            	x: x, 
	            	y: y.degree, 
				},
				{ label: "Out Degree", 
					x: x, 
					y: y.outdegree 
				},
				{ label: "In Degree",
					x: x,
					y: y.indegree
				}
	];
	var dimensions = {
			width: 640,
			height: 500,
			margins: {top: 10, right: 160, bottom: 10, left:160}
	};
	
	
	if (config.dimensions) $.extend(dimensions,config.dimensions);
	var xy_chart = d3_xy_chart()
	    .width(dimensions.width + dimensions.margins.left + dimensions.margins.right)
	    .height(dimensions.height + dimensions.margins.top + dimensions.margins.bottom)
	    .xlabel("X Axis")
	    .ylabel("Y Axis") ;
	var svg = d3.select("#" + config.rootId).append("svg")
	    .datum(data)
	    .call(xy_chart) ;
	
	function d3_xy_chart() {
	    var width = dimensions.width,  
	        height = dimensions.height, 
	        xlabel = "#datasets",
	        ylabel = "Average (in|out)degree" ;
	    
	    function chart(selection) {
	        selection.each(function(datasets) {
	            //
	            // Create the plot. 
	            //
	            var margin = {top: 20, right: 80, bottom: 30, left: 50}, 
	                innerwidth = width - margin.left - margin.right,
	                innerheight = height - margin.top - margin.bottom ;
	            
	            var x_scale = d3.scale.linear()
	                .range([0, innerwidth])
	                .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }), 
	                          d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;
	            
	            var y_scale = d3.scale.linear()
	                .range([innerheight, 0])
	                .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
	                          d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;
	
	            var color_scale = d3.scale.category10()
	                .domain(d3.range(datasets.length)) ;
	
	            var x_axis = d3.svg.axis()
	                .scale(x_scale)
	                .orient("bottom") ;
	
	            var y_axis = d3.svg.axis()
	                .scale(y_scale)
	                .orient("left") ;
	
	            var x_grid = d3.svg.axis()
	                .scale(x_scale)
	                .orient("bottom")
	                .tickSize(-innerheight)
	                .tickFormat("") ;
	
	            var y_grid = d3.svg.axis()
	                .scale(y_scale)
	                .orient("left") 
	                .tickSize(-innerwidth)
	                .tickFormat("") ;
	
	            var draw_line = d3.svg.line()
	                .interpolate("basis")
	                .x(function(d) { 
	                	return x_scale(d[0]);
	                	})
	                .y(function(d) { return y_scale(d[1]); }) ;
	
	            var svg = d3.select(this)
	                .attr("width", width)
	                .attr("height", height)
	                .append("g")
	                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
	            
	            svg.append("g")
	                .attr("class", "x grid")
	                .attr("transform", "translate(0," + innerheight + ")")
	                .call(x_grid) ;
	
	            svg.append("g")
	                .attr("class", "y grid")
	                .call(y_grid) ;
	
	            svg.append("g")
	                .attr("class", "x axis")
	                .attr("transform", "translate(0," + innerheight + ")") 
	                .call(x_axis)
	                .append("text")
	                .attr("dy", "-.71em")
	                .attr("x", innerwidth)
	                .style("text-anchor", "end")
	                .text(xlabel) ;
	            
	            svg.append("g")
	                .attr("class", "y axis")
	                .call(y_axis)
	                .append("text")
	                .attr("transform", "rotate(-90)")
	                .attr("y", 6)
	                .attr("dy", "0.71em")
	                .style("text-anchor", "end")
	                .text(ylabel) ;
	
	            var data_lines = svg.selectAll(".d3_xy_chart_line")
	                .data(datasets.map(function(d) {return {cor: d3.zip(d.x, d.y), label: d.label};}))
	                .enter().append("g")
	                .attr("class", function(d){
	                	return "d3_xy_chart_line " + d.label.toLowerCase().replace(" ", "");
	                }) ;
	            
	            data_lines.append("path")
	                .attr("class", "line")
	                .attr("d", function(d) {
	                	return draw_line(d.cor);
	                	})
	                .attr("stroke", function(_, i) {
	                	return color_scale(i);
	                	}) ;
	            
	            data_lines.append("text")
	                .datum(function(d, i) { return {
	                	name: d.label, final: d.cor[d.cor.length-1]
	                }; }) 
	                .attr("transform", function(d) { 
	                    return ( "translate(" + x_scale(d.final[0]) + "," + 
	                             y_scale(d.final[1]) + ")" ) ; })
	                .attr("x", 3)
	                .attr("dy", ".35em")
	                .attr("fill", function(_, i) { return color_scale(i); })
	                .text(function(d) { return d.name; }) ;
	
	        }) ;
	    }
	
	    chart.width = function(value) {
	        if (!arguments.length) return width;
	        width = value;
	        return chart;
	    };
	
	    chart.height = function(value) {
	        if (!arguments.length) return height;
	        height = value;
	        return chart;
	    };
	
	    chart.xlabel = function(value) {
	        if(!arguments.length) return xlabel ;
	        xlabel = value ;
	        return chart ;
	    } ;
	
	    chart.ylabel = function(value) {
	        if(!arguments.length) return ylabel ;
	        ylabel = value ;
	        return chart ;
	    } ;
	
	    return chart;
	};
};