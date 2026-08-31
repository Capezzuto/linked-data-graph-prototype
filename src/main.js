import * as d3 from 'd3';

const width = Math.min(500, window.screen.width - 120);
const height = Math.min(500, window.screen.height - 120);

const container = document.getElementById('app');
console.log('container', container);

const svg = d3
  .create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewbox', `0 0 ${width} ${height}`)
  .style('background', '#333333');

container.append(svg.node());
