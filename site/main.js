var data;
var d3;

var colors = ['#7F3C8D','#11A579','#3969AC','#F2B701','#E73F74','#80BA5A','#E68310','#008695','#CF1C90','#f97b72','#4b4b8f','#A5AA99'];

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
      return colors[d.color];
    });

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
  }

  /* ===== inputs and buttons ===== */

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

  /* ===== new data button ===== */

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