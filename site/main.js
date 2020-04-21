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
  for(i = 0; i < dataset.length; i++){
    alltimes += [d3.values(dataset[i])];
  }

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

  var svgFrame = d3.select('body')
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

  function removeDot() {
    dots.on('click', function(d) {

    var index = data.indexOf(d)

    d3.selectAll('.uiPanel').select('text').text(playtime_data[data.indexOf(d)].name);



    console.log(alltimes)
    console.log(alltimes[50])
    var newData = [];
    for(i = 0; i < operators.length; i++){
      newData.push([operators[i], alltimes[data.indexOf(d)][i]]);
    }



    console.log(newData);
    var header = d3.selectAll('.uiPanel').select('table').append("thead").append("tr");
    header
           .selectAll("th")
           .data(["operator", "time"])
           .enter()
           .append("th")
           .text(function(d) { return d; });
   var tablebody = table.append("tbody");
   rows = tablebody
           .selectAll("tr")
           .data(newData)
           .enter()
           .append("tr");
   // We built the rows using the nested array - now each row has its own array.
   cells = rows.selectAll("td")
       // each row has data associated; we get it and enter it for the cells.
           .data(function(d) {

               return d;
           })
           .enter()
           .append("td")
           .text(function(d) {
               return d;
           });

  })}

  /* ===== apend/update axes ===== */

  function appendAxes() {
    svgFrame.append('g')
      .attr('class', 'x_axis')
      .attr('transform', 'translate(0,' + (h - padding) + ')')
      .style('font-size', '14px')
      .call(xAxis);

    svgFrame.append('g')
      .attr('class', 'y_axis')
      .attr('transform', 'translate(' + padding + ',0)')
      .style('font-size', '12px')
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

  var dot_info_output = d3.select('.uiPanel')
    .append('text')
    .text('click on player')
    .attr('test');

  var table = d3.select(".uiPanel").append("table");
    var header = table.append("thead").append("tr");
    header
           .selectAll("th")
           .data(["operator", "time"])
           .enter()
           .append("th")
           .text(function(d) { return d; });
   var tablebody = table.append("tbody");
   rows = tablebody
           .selectAll("tr")
           .data(tableStart)
           .enter()
           .append("tr");
   // We built the rows using the nested array - now each row has its own array.
   cells = rows.selectAll("td")
       // each row has data associated; we get it and enter it for the cells.
           .data(function(d) {

               return d;
           })
           .enter()
           .append("td")
           .text(function(d) {
               return d;
           });

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
