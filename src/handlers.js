import * as d3 from 'd3';

// Dragging
// Implementation from https://observablehq.com/@d3/force-directed-tree
export const dragHandlers = (simulation) => {
  function dragstarted(evt, d) {
    if (!evt.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(evt, d) {
    d.fx = evt.x;
    d.fy = evt.y;
  }

  function dragended(evt, d) {
    if (!evt.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended);
};

// Tooltips
export const tooltipHandlers = (selection, { tooltip, tooltipTarget, width, height, color }) => {
  function showTooltip(evt, d) {
    const [mx, my] = d3.pointer(evt);
    const nodeData = d.data?.nodeData ?? d.data;
    const html = Object.entries(nodeData).reduce((output, entry) => {
      if (entry[0] === 'id') {
        return (
          output
          + `<p class='tooltip-text'>
        <b>${entry[0]}:</b> <a href="${entry[1]}" rel="nofollow">${entry[1]}</a>
        </p>`
        );
      }
      return output + `<p class='tooltip-text'><b>${entry[0]}:</b> ${entry[1]}</p>`;
    }, '');

    tooltipTarget?.attr('fill', (d) => color(d.depth));
    tooltipTarget = d3.select(evt.target);
    setTimeout(() => {
      tooltipTarget.attr('fill', '#00ff00');
    }, 0);

    tooltip
      .style('top', my <= 0 ? `${evt.y + 24}px` : 'auto')
      .style('bottom', my <= 0 ? 'auto' : `${height - (evt.y - 24)}px`)
      .style('left', mx <= 0 ? `${evt.x - 24}px` : 'auto')
      .style('right', mx <= 0 ? 'auto' : `${width - (evt.x + 24)}px`);
    tooltip.html(html);
    tooltip.node().show();
    tooltip.node().focus();
  }

  selection.on('click', showTooltip);
  tooltip.node().addEventListener('close', (evt) => {
    tooltipTarget.attr('fill', (d) => color(d.depth));
  });

  return selection;
};

// Zoom
export const zoomHandler = (g) => {
  function zoomed(evt) {
    const { transform } = evt;
    g.attr('transform', transform).attr('stroke-width', 1 / transform.k);
  }

  return d3.zoom().scaleExtent([1, 3]).on('zoom', zoomed);
};

// Input field
const validate = (str) => {
  const regex =
    /^(https\:\/\/|http\:\/\/|)data\.getty\.edu\/museum\/collection\/(object|place|document|group|person|exhibition|activity)/g;
  if (regex.test(str)) console.log('Passed validation');
  else console.log('Failed validation');
};

export const getApiUrl = () => {
  validate('https://data.getty.edu/museum/collection/object/e728fadd-4e33-4b09-8325-2b572b307871');
};
