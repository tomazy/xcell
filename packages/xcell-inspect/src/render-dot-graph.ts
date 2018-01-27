import * as yo from 'yo-yo';

import { DotEdge, DotGraph, DotNode, DotPoint } from './dot-layout';

// tslint:disable-next-line:no-var-requires
const debug = require('debug')('xcell-inspect:render-dot-graph');

export interface Options {
  graph: DotGraph;
  zoom: number;
  added: string[];
  changed: string[];
}
/**
 *
 * @param graph: graph
 * @param id: all the nodes with IDs set disappear when we hide the graph. Having an ID on the svg fixed that.
 */
export function renderDotGraph(options: Options): HTMLElement {
  const {
    graph,
    zoom,
    added,
    changed,
  } = options;
  debug('>>renderDotGraph. nodes: %d, edges: %d, added: %d, changed: %d',
    graph.nodes.length, graph.edges.length, added.length, changed.length);

  const margin = 0.05;
  const nodes = graph.nodes.map(renderNode);
  const edges = graph.edges.map(renderEdge);
  return yo`
    <svg
      width="${graph.width}in"
      height="${graph.height}in"
      viewBox="${-margin} ${-margin} ${graph.width + 2 * margin} ${graph.height + 2 * margin}"
      style="zoom:${zoom}"
    >
      <defs>
        <marker
          id='arrow'
          viewBox='0 -5 10 10'
          refX='0'
          refY='0'
          markerWidth='6'
          markerHeight='6'
          orient='auto'
          fill='black'
        >
          <path d='M0,-5L10,0L0,5' />
        </marker>
      </defs>
      <g class="edges">
        ${edges}
      </g>
      <g class="nodes">
        ${nodes}
      </g>
    </svg>
  `;

  function renderEdge(edge: DotEdge) {
    const { points, label, color} = edge;
    const [p0, ...bSpline] = points;
    const d = [moveTo(p0), bezierTo(...bSpline)].join(' ');
    return yo`
      <g class="edge" id="edge-${edge.tail}-${edge.head}">
        <path
          marker-end='url(#arrow)'
          d=${d}
        />
      </g>
    `;
  }

  function renderNode(node: DotNode) {
    const { x, y, width, height, label, id } = node;
    const newNode = isNew(id);
    const changedNode = !newNode && isChanged(id);

    const classNames = [
      'node',
      ... newNode ? ['new'] : [],
      ... changedNode ? ['changed'] : [],
    ].join(' ');

    return yo`
      <g class="${classNames}" transform="translate(${x},${y})" id="cell-${id}">
        <ellipse cx="0" cy="0" rx="${width / 2}" ry="${height / 2}"/>
        <text text-anchor="middle">
          ${label}
        </text>
      </g>
    `;
  }

  function bezierTo(...points: DotPoint[]): string {
    return 'C' + points.map(p => `${p.x} ${p.y}`).join(',');
  }

  function moveTo(p: DotPoint): string {
    return 'M' + `${p.x} ${p.y}`;
  }

  function isNew(id: string) {
    return added.indexOf(id) > -1;
  }

  function isChanged(id: string) {
    return changed.indexOf(id) > -1;
  }
}
