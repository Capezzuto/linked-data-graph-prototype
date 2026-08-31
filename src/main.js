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

/**
 * Render to page
 */

const container = document.getElementById('app');
console.log('container', container);
const svg = d3
  .create('svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewbox', `0 0 ${width} ${height}`)
  .style('background', '#333333');

container.append(svg.node());
