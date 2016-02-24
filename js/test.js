//==========================
// set up SVG for D3
//==========================
var width  = 960,
    height = 500,
    colors = d3.scale.category10();

var svg = d3.select('#draw')
  .append('svg')
  .attr('oncontextmenu', 'return false;') // disable right-click content menue
  .attr('width', width)
  .attr('height', height);

//==========================
// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target;
//  - edge directions (saw in the UI) are set by 'left' and 'right'.
//==========================
var nodes = [
    {id: 0, reflexive: false},
    {id: 1, reflexive: false},
    {id: 2, reflexive: false},
    {id: 3, reflexive: false},
    {id: 4, reflexive: false},
    {id: 5, reflexive: false},
    {id: 6, reflexive: false},
    {id: 7, reflexive: false},
  ],
  lastNodeId = 8,


  links = [
    {source: nodes[0], target: nodes[5], left: false, right: true },
    {source: nodes[0], target: nodes[6], left: false, right: true },
    {source: nodes[0], target: nodes[7], left: false, right: true },
    {source: nodes[1], target: nodes[5], left: false, right: true },
    {source: nodes[1], target: nodes[6], left: false, right: true },
    {source: nodes[1], target: nodes[7], left: false, right: true },
    {source: nodes[2], target: nodes[5], left: false, right: true },
    {source: nodes[2], target: nodes[6], left: false, right: true },
    {source: nodes[2], target: nodes[7], left: false, right: true },
    {source: nodes[3], target: nodes[5], left: false, right: true },
    {source: nodes[3], target: nodes[6], left: false, right: true },
    {source: nodes[3], target: nodes[7], left: false, right: true },
    {source: nodes[4], target: nodes[5], left: false, right: true },
    {source: nodes[4], target: nodes[6], left: false, right: true },
    {source: nodes[4], target: nodes[7], left: false, right: true },
  ];



//==========================
// init D3 force layout
//==========================
var force = d3.layout.force()
    .nodes(nodes)
    .links([])
    .size([width, height])
    // .linkDistance(function(d){
    // var deltaX = d.target.x - d.source.x,
    //       deltaY = d.target.y - d.source.y;
    //     return Math.sqrt(deltaX * deltaX + deltaY * deltaY);})
    .gravity(0)
    .charge(0)
    .on('tick', tick) ; // 'tick': how's updating every step




//==========================
// define arrow markers for graph links
//==========================
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)  // markers postion at line
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');



// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');


var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;



// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  // path.attr('d', function(d) {
  //   var deltaX = d.target.x - d.source.x,
  //       deltaY = d.target.y - d.source.y,
  //       dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
  //       normX = deltaX / dist,
  //       normY = deltaY / dist,
  //       sourcePadding = d.left ? 17 : 12,
  //       targetPadding = d.right ? 17 : 12,
  //       sourceX = d.source.x + (sourcePadding * normX),
  //       sourceY = d.source.y + (sourcePadding * normY),
  //       targetX = d.target.x - (targetPadding * normX),
  //       targetY = d.target.y - (targetPadding * normY);
  //   return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  // });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}



  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
  });



// circle (node) group
// NB: the function arg is crucial here! nodes are known by id, not by index!
circle = circle.data(nodes, function(d) { return d.id; });

// update existing nodes (reflexive & selected visual states)
circle.selectAll('circle')
  .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
  .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
var g = circle.enter().append('svg:g').call(force.drag);

g.append('svg:circle')
  .attr('class', 'node')
  .attr('r', 12)
  .attr('cx', function(d) {return d.x ;})
  .attr('cy', function(d) {return d.y ;})
  .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
  .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
  .classed('reflexive', function(d) { return d.reflexive; })
  .on('mouseover', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
  })
 .on('mouseout', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
 });
// show node IDs
g.append('svg:text')
  .attr('x', 0)
  .attr('y', 4)
  .attr('class', 'id')
  .text(function(d) { return d.id; });


force.start();



var connect = 0;

function FullyConnect() {

  if(connect === 1){
      connect = 0;
      path.attr('d', '');
      return;
  }

      // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  connect = 1;

}

function Send(){

    var nodes = [
        {layer1 : 5},
        {layer2 : 3}
    ];


    $.post("http://127.0.0.1:8000/dashboard/send-net-info/" , JSON.stringify(nodes)).done(function(data) {
      console.log(data);
    });

    // $.ajax({
    //   type: 'POST',
    //   url: 'http://127.0.0.1:8000/dashboard/send-net-info/',
    //   data: nodes,
    //   dataType: 'json',
    //   async: false,
    //   success: function(data) {
    //     console.log(data);
    //   }
    // });

}
