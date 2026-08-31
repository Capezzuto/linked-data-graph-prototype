import * as d3 from 'd3';

const width = Math.min(500, window.screen.width - 120);
const height = Math.min(500, window.screen.height - 120);

/**
 * Format data
 */
// const data = fetch('https://data.getty.edu/museum/collection/object/ee0325a5-c8f6-4cae-9fb3-d67310989297');
const data = await import('./assets/response.json');
console.log('data', data);

const formattedData = Object.entries(data).reduce(
  (result, entry) => {
    if (typeof entry[1] === 'string') {
      result.nodeData[entry[0]] = entry[1];
      return result;
    }
    if (typeof entry[1] === 'object') {
      const isArray = Array.isArray(entry[1]);
      result.children.push({
        nodeData: isArray ? { _label: entry[0] } : { ...entry[1] },
        children: isArray ? entry[1] : [],
      });
      return result;
    }
  },
  { nodeData: {}, children: [] },
);
console.log('formattedData', formattedData);

const root = d3.hierarchy(formattedData);
const links = root.links();
const nodes = root.descendants();
console.log('links', links);
console.log('nodes', nodes);

/**
 * Event Handlers
 */
// Implementation from https://observablehq.com/@d3/force-directed-tree
const dragHandlers = (simulation) => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
};

/**
 * Render to page
 */

const container = document.getElementById('app');
const svg = d3
  .create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewbox', `0 0 ${width} ${height}`)
  .style('background', '#202828');

const simulation = d3
  .forceSimulation(nodes)
  .force(
    'link',
    d3
      .forceLink(links)
      .id((d) => d.data?._label ?? d.data?.nodeData?._label)
      .distance(20)
      .strength(0.5),
  )
  .force('charge', d3.forceManyBody().strength(-80))
  .force('x', d3.forceX())
  .force('y', d3.forceY());

const linkLines = svg
  .append('g')
  .style('transform', 'translate(50%, 50%)')
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('stroke', '#666666');

const nodeCircles = svg
  .append('g')
  .style('transform', 'translate(50%, 50%)')
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('r', 6)
  .attr('fill', '#ff0000')
  .attr('stroke', '#888888')
  .call(dragHandlers(simulation));

container.append(svg.node());

simulation.on('tick', () => {
  linkLines
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);

  nodeCircles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
});
