import * as d3 from 'd3';
import { formatData } from './format.js';
import { zoomHandler, dragHandlers, tooltipHandlers, getApiUrl, checkInput, setErrorMessage } from './handlers.js';

const width = Math.min(800, window.screen.width - 120);
const height = Math.min(800, window.screen.height - 120);
const container = document.getElementById('app');
const getRecordsButton = document.getElementById('getRecordsButton');
const input = document.getElementById('apiUrlField');
const tooltip = d3.select(container).select('#tooltip');
let tooltipTarget;

const NODE_RADII = {
  0: 10,
  1: 7,
  2: 7,
  3: 6,
  4: 6,
  5: 6,
  6: 5,
  7: 5,
  8: 4,
  9: 4,
  10: 4,
  11: 4,
  12: 4,
};

// set up graph structure (this part will not change with changes to data)
const svg = d3
  .create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewbox', `${width / 2} ${height / 2} ${width} ${height}`)
  .style('background', '#202828');

const group = svg.append('g');

const simulation = d3
  .forceSimulation()
  .force('link', d3.forceLink().distance(0).strength(1))
  .force('charge', d3.forceManyBody().strength(-20))
  .force('x', d3.forceX())
  .force('y', d3.forceY());

let linkLines = group.append('g').style('transform', 'translate(50%, 50%)').selectAll('line');
let nodeCircles = group.append('g').style('transform', 'translate(50%, 50%)').selectAll('circle');

function renderGraph(data) {
  // format data
  const formattedData = Object.entries(data).reduce(formatData, { nodeDepth: 0, nodeData: {}, children: [] });

  const root = d3.hierarchy(formattedData);
  const links = root.links();
  const nodes = root.descendants();
  const depth = nodes.reduce((max, n) => Math.max(n.depth + 1, max), 0);
  const color = d3.scaleSequential([0, depth], d3.interpolateYlGnBu);

  linkLines = linkLines.data(links).join('line').attr('stroke', '#666666');

  nodeCircles = nodeCircles
    .data(nodes)
    .join('circle')
    .attr('r', (d) => NODE_RADII[d.depth] ?? 4)
    .attr('fill', (d) => color(d.depth))
    .attr('stroke', '#888888')
    .call(tooltipHandlers, { tooltip, tooltipTarget, width, height, color })
    .call(dragHandlers(simulation));

  svg.call(zoomHandler(group));

  container.append(svg.node());

  simulation.force('link').links(links);
  simulation.nodes(nodes);
  simulation.alpha(1).restart();

  simulation.on('tick', () => {
    linkLines
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    nodeCircles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
  });
}

// const data = fetch('https://data.getty.edu/museum/collection/object/ee0325a5-c8f6-4cae-9fb3-d67310989297');
import('./assets/response.json').then((data) => {
  renderGraph(data);
});

input.addEventListener('input', checkInput);

getRecordsButton.addEventListener('click', () => {
  getApiUrl()
    .then((data) => {
      renderGraph(data);
    })
    .catch((err) => {
      setErrorMessage(err);
    });
});
