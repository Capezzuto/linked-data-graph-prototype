import * as d3 from 'd3';

const width = Math.min(500, window.screen.width - 120);
const height = Math.min(500, window.screen.height - 120);
const container = document.getElementById('app');
const nodeRadii = {
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

/**
 * Format data
 */
// const data = fetch('https://data.getty.edu/museum/collection/object/ee0325a5-c8f6-4cae-9fb3-d67310989297');
const data = await import('./assets/response.json');
console.log('data', data);

const formatData = (result, entry) => {
  // default property seems to reproduce structure of larger object, so omit for now
  if (entry[0] === 'default') return result;

  if (typeof entry[1] === 'string') {
    result.nodeData[entry[0]] = entry[1];
    return result;
  }

  if (typeof entry[1] === 'object') {
    const isArray = Array.isArray(entry[1]);
    result.children.push({
      nodeDepth: result.nodeDepth + 1,
      nodeData: isArray ? { _label: entry[0] } : { ...entry[1] },
      children: isArray
        ? entry[1].map((n) => {
            if (typeof n === 'object') {
              return Object.entries(n).reduce(formatData, {
                nodeDepth: result.nodeDepth + 2,
                nodeData: {},
                children: [],
              });
            }
            return n;
          })
        : [],
    });
  }
  return result;
};

const formattedData = Object.entries(data).reduce(formatData, { nodeDepth: 0, nodeData: {}, children: [] });
console.log('formattedData', formattedData);

const root = d3.hierarchy(formattedData);
const links = root.links();
const nodes = root.descendants();
const depth = Math.min(
  nodes.reduce((max, node) => Math.max(node.depth + 1, max), 0),
  12,
);
const color = d3.scaleOrdinal(d3.schemeRdYlBu[depth]);
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

const showTooltip = (evt, d) => {
  const tooltip = d3.select(container).select('#tooltip');
  const [mx, my] = d3.pointer(evt);
  console.log('d', d);
  tooltip
    .style('top', my <= 0 ? `${evt.y + 24}px` : 'auto')
    .style('bottom', my <= 0 ? 'auto' : `${height - (evt.y - 24)}px`)
    .style('left', mx <= 0 ? `${evt.x - 24}px` : 'auto')
    .style('right', mx <= 0 ? 'auto' : `${width - (evt.x + 24)}px`);
  tooltip.text(JSON.stringify(d.data?.nodeData ?? d.data));
  tooltip.node().show();
};

/**
 * Render to page
 */

const svg = d3
  .create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewbox', `0 0 ${width} ${height}`)
  .style('background', '#202828');

const simulation = d3
  .forceSimulation(nodes)
  .force('link', d3.forceLink(links).distance(0).strength(1))
  .force('charge', d3.forceManyBody().strength(-20))
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
  .attr('r', (d) => nodeRadii[d.depth] ?? 4)
  .attr('fill', (d) => color(d.depth))
  .attr('stroke', '#888888')
  .call(dragHandlers(simulation));

nodeCircles.on('click', showTooltip);

container.append(svg.node());

simulation.on('tick', () => {
  linkLines
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);

  nodeCircles.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
});
