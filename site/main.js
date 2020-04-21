var data;
var d3;

var alltimes = [];
var colors = ['#7F3C8D','#11A579','#3969AC','#F2B701','#E73F74','#80BA5A','#E68310','#008695','#CF1C90','#f97b72','#4b4b8f','#A5AA99'];
var operators = ["doc","twitch","ash","thermite","blitz","buck","hibana","kapkan","pulse","castle","rook","bandit","smoke","frost","valkyrie","tachanka","glaz","fuze","sledge","montagne","mute","echo","thatcher","capitao","iq","blackbeard","jager","caveira","jackal","mira","lesion","ying","ela","dokkaebi","vigil","zofia","finka","lion","alibi","maestro","maverick","clash","nomad","kaid","mozzie","gridlock","warden","nakk","amaru","goyo"];
var tableStart = [];
for(i = 0; i < operators.length; i++){
  tableStart.push([operators[i], "0:00"]);
}

d3.csv('playtimes.csv', function(dataset) {
  playtime_data = dataset;
  console.log(playtime_data[0])
});

d3.csv('out.csv', function(dataset) {
  data = dataset;
  buildPlot();
});

/* ===== BUILD PLOT FUNCTION ===== */

function buildPlot() {
  var w = 600;
  var h = 500;
  var padding = 10;

  var key = function(d) {
    return d.key;
  };
  var newDataPoint = '';

  var svgFrame = d3.select('#svg')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

  /* ===== scales and axes ===== */

  var xScale = d3.scaleLinear()
    .domain([-.2, .2])
    .rangeRound([padding, w - padding]);

  var yScale = d3.scaleLinear()
    .domain([-.15,.15])
    .rangeRound([h - padding, padding]);

  var xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(9);

  var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(9);
	
	
  svgFrame.append("text")             
      .attr("transform",
            "translate(" + (w/2) + " ," + 
                           (h + padding + 20) + ")")
      .style("text-anchor", "middle")
	  .style("stroke", "white")
      .text("Ash/Jager-ness");
	  
  svgFrame.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - padding - 40)
      .attr("x",0 - (h / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
	  .style("stroke", "white")
      .text("Thermite/Valk-ness");    

  /* ===== dots ===== */

  var dots = svgFrame.selectAll('circle').data(data, key)
    .enter()
    .append('circle')
    .attr('cx', function(d) {
      return xScale(d.x);
    })
    .attr('cy', function(d) {
      return yScale(d.y);
    })
    .attr('r', 5)
    .attr('fill', function(d) {
      return colors[d.color1];
    });


    appendAxes();
    removeDot();

  function addNewDot() {
    dots = svgFrame.selectAll('circle').data(data, key);
    dots.enter()
      .append('circle')
      .attr('cx', function(d) {
        return xScale(d.x);
      })
      .attr('cy', function(d) {
        return yScale(d.y);
      })
      .attr('class', 'userDot')
      .attr('r', 5)
      .attr('fill', 'darkblue')
      .attr('opacity', 0)
      .transition()
      .duration(200)
      .attr('r', 15)
      .attr('opacity', 1)
      .transition()
      .duration(500)
      .attr('r', 5)
      .attr('fill', 'steelblue');

    dots.merge(dots)
      .transition()
      .duration(500)
      .attr('cx', function(d) {
        return xScale(d.x);
      })
      .attr('cy', function(d) {
        return yScale(d.y);
      })
    dots = d3.selectAll('.userDot');

    removeDot()
  }

  /* ===== remove dots ===== */
  
  function tabulate(data) {
	  d3.selectAll("tr").remove();
	  
	  thead.append("tr")
			.selectAll("th")
			.data(columns)
			.enter()
			.append("th")
				.text(function(column) { return column; });
	  
		//create rows for each
		var tr = table.selectAll("tr")
            .data(data)
            .enter()
            .append("tr");

		// append entering cells to each row
		var td = tr.selectAll("td")
            .data(function(d) { return d; })
            .enter()
            .append("td");


		// add content from the dataset
			var content = td.text(function(d) { return d; });

  }


  function removeDot() {
    dots.on('click', function(d) {

    var index = data.indexOf(d)

    d3.selectAll('body').select('#playername').text(playtime_data[data.indexOf(d)].name);
	
	var newdata = []
	
	var keys = d3.keys(playtime_data[index]);
	var vals = d3.values(playtime_data[index]);
	
	function capitalizeFirstLetter(string) {
	  return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	for(x in keys) {
		if(keys[x] != "name" && keys[x] != "key") {
			newdata.push([capitalizeFirstLetter(keys[x]), vals[x]]);
		}
	}
	
	newdata.sort(sortFunction);

	function sortFunction(a, b) {
		var alpha = a[1].split(':'); // split it at the colons
		// minutes are worth 60 seconds. Hours are worth 60 minutes.
		a2 = (+alpha[0]) * 60 * 60 + (+alpha[1]) * 60 + (+alpha[2]); 
		
		var beta = b[1].split(':'); // split it at the colons
		// minutes are worth 60 seconds. Hours are worth 60 minutes.
		b2 = (+beta[0]) * 60 * 60 + (+beta[1]) * 60 + (+beta[2]); 
		
		if (a2 === b2) {
			return 0;
		}
		else {
			return (a2 > b2) ? -1 : 1;
		}
	}

	var peopleTable = tabulate(newdata);
	
  })}

  /* ===== apend/update axes ===== */

  function appendAxes() {
    svgFrame.append('g')
      .attr('class', 'x_axis')
      .attr('transform', 'translate(0,' + (h - padding) + ')')
      .style('font-size', '14px')
	  .style('stroke','white')
      .call(xAxis);

    svgFrame.append('g')
      .attr('class', 'y_axis')
      .attr('transform', 'translate(' + padding + ',0)')
      .style('font-size', '12px')
	  .style('stroke','white')
      .call(yAxis);
  }

  function updateScales() {
    xScale
      .domain([0,d3.max(data, function(d) {return parseFloat(d.age);})])
      .nice();
    yScale
      .domain([0,d3.max(data, function(d) {return parseFloat(d.income);})])
      .nice();

    svgFrame.select('.x_axis')
      .transition()
      .duration(500)
      .call(xAxis);

    svgFrame.select('.y_axis')
      .transition()
      .duration(500)
      .call(yAxis);
  }

  /* ===== inputs and buttons ===== */

  var explain = d3.select('.uiPanel')
    .append('text')
	.text('Not yet implemented: put yourself on the chart')
	.style('font-size', '10px');

  var groupings = d3.select('.uiPanel')
    .append('select')
	.attr('id', 'groupings')
	.attr('name', 'name-list')
	.selectAll('option')
	.data(["8 Colors", "4 Colors"]).enter()
	.append('option')
	.text(function(d) { return d;})
	.attr("value", function (d) { return d; });

  var nameInput = d3.select('.uiPanel')
    .append('input')
    .attr('id', 'inputUsername')
    .attr('placeholder', 'username');

  var drpdwn = ["PC", "PS4", "Xbox"];

  var platformInput = d3.select('.uiPanel')
    .append('select')
	.attr('id', 'inputPlatform')
	.attr('name', 'name-list')
	.selectAll('option')
	.data(drpdwn).enter()
	.append('option')
	.text(function(d) { return d;})
	.attr("value", function (d) { return d; });

  var button_newDot = d3.select('.uiPanel')
    .append('button')
    .attr('id', 'update')
    .text('add dot');

  var dot_info_output = d3.select('#tablename')
    .append('text')
	.attr('id','playername')
	.attr('height', '400px')
    .text('click on player');

	columns = ["Operator", "Playtime (hrs)"];

	var table = d3.select("#table-spot").append("table")
			.attr("id", "table")
			.attr("style", "margin-left: 250px"),
			thead = table.append("thead"),
			tbody = table.append("tbody").attr("id","t-body");

  /* ===== new data button (ON CLICK) ===== */

  var colorselected = 0;

  d3.select('#groupings').on('change', function() {
	  colorselected = Math.abs(colorselected - 1);
	  svgFrame.selectAll("circle")
	    .data(data, key)
		.transition()
		.duration(1000)
		.attr("fill", function(d) {
		  var clrs = [d.color1, d.color2];
		  console.log(colors[clrs[colorselected]]);
	      return colors[clrs[colorselected]];
		});
  });

  d3.select('#update').on('click', function() {
    if (
      document.getElementById('inputUsername').value === '' &&
      document.getElementById('inputPlatform').value === ''
    )
      return;
	return; //not yet implemented
	//calculate x & y coords
	var uname = document.getElementById('inputUsername').value;
	var platform = document.getElementById('inputPlatform').value;
	console.log(uname);
	console.log(platform);

    var newKey =
      data.length === 0 ? 1 : parseFloat(data[data.length - 1].key) + 1;

    newDataPoint = {
      key: newKey,
      x: calcx,
      y: calcy,
      color: '#000000'
    };

    data.push(newDataPoint);

    addNewDot();

    document.getElementById('inputUsername').value = '';
    newDataPoint = '';
  });
}
