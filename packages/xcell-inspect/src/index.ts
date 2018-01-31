import debounce = require('lodash.debounce');
import deepEqual = require('lodash.isequal');
import { Cell, createCell as xcell } from 'xcell';
import * as yo from 'yo-yo';

import cell2node from './cell-to-dot-node';
import createDOT from './create-dot';
import { diffNodes } from './dot-layout';
import { renderDotGraph } from './render-dot-graph';
import { renderRoot } from './render-root';
import { workerFunctions } from './worker-functions';

// tslint:disable-next-line:no-var-requires
const debug = require('debug')('xcell-inspect');

const workerFns = workerFunctions();

export interface Options {
  renderGraph: boolean;
  renderDOT: boolean;
  hidden: boolean;
  zoom: number;
}

const defaults: Options = {
  renderGraph: true,
  renderDOT: true,
  hidden: false,
  zoom: 1.0,
};

export function inspect(cells: Cell[], options: Options = defaults) {
  const debouncedRefreshCurrentCells = debounce(refreshCurrentCells, 100, { maxWait: 1000 });

  const $zoom = xcell(options.zoom || 1.0);
  const $loading = xcell(false);
  const $hidden = xcell(Boolean(options.hidden));

  $hidden.on('change', ({ value }) => {
    if (!value) refreshCurrentCells();
  });

  const $lastErrorInTime = xcell({ error: null, time: 0 });

  const $currentCells = xcell(discoverAllCells(cells));

  addChangeListener($currentCells.value, cellChanged);

  $currentCells.on('change', ({ value }, previous: Cell[]) => {
    debug('$currentCells changed. Count: %d', value.length);

    removeChangeListener(previous, cellChanged);
    addChangeListener(value, cellChanged);
  });

  const $cellCount = xcell([$currentCells], cc => cc.length);

  const $dotNodes = xcell([$currentCells], currentCells => currentCells.map(cell2node));

  const $digraph = xcell([$dotNodes], createDOT);
  $digraph.on('change', ({ value }) => {
    debug('digraph', value);
  });

  const $graphInTime = xcell({ graph: null, time: 0 });

  const $graph = xcell([$graphInTime], ({ graph }) => graph);

  const $lastTwoGraphsInTime = xcell([$graphInTime], function(graphInTime) {
    const [, previous] = this.value || [null, { graph: null, time: null }];
    return [previous, graphInTime];
  });

  const $diff = new Cell({
    equalFunction: deepEqual,
    deps: [$lastTwoGraphsInTime],
    formula: ([a, b]) => diffNodes(a.graph, b.graph),
  });

  const $error = xcell(
    [$lastErrorInTime, $graphInTime],
    ( lastErrorInTime,  graphInTime) => {
      if (lastErrorInTime.time > graphInTime.time) {
        return lastErrorInTime.error;
      } else {
        return null;
      }
    });

  const graphInTimeTimer = new Timer(graph => {
    $graphInTime.value = { graph, time: Date.now() };
  }, 200);

  xcell([$digraph, $hidden], async (digraph,  hidden) => {
    graphInTimeTimer.stop();

    if (hidden) return;
    if (!options.renderGraph) return;

    const loading = smartLoading(v => $loading.value = v);

    try {
      const graph = await workerFns.generateDotGraph(digraph);
      $graphInTime.value = { graph, time: Date.now() };
      graphInTimeTimer.start(graph);
    } catch (error) {
      $lastErrorInTime.value = {
        error,
        time: Date.now(),
      };
    } finally {
      loading.done();
    }
  });

  const $graphHtml = xcell(null);
  xcell(
      [$graph, $zoom, $hidden, $diff],
      ( graph,  zoom,  hidden,  diff) => {

    if (!graph) return;
    if (hidden) return;

    const svg = renderDotGraph({
      graph,
      zoom,
      ...diff,
    });

    $graphHtml.value = svg;
  });

  const $rootHtml = xcell(
    [$graphHtml, $error, $digraph, $cellCount, $loading, $hidden, $zoom],
    ( graphHtml,  error,  digraph,  cellCount, loading,  hidden,  zoom) => (
      renderRoot({
          hidden,
          loading,
          zoom,
          cellCount,
          // yo-yo (morhpdom) mutates provided children nodes so we have to give it a clone here :(
          graph: graphHtml && graphHtml.cloneNode(true),
          error,
          dot: options.renderDOT ? digraph : null,
        },
        send,
      )
  ));

  const root: HTMLElement = $rootHtml.value;

  $rootHtml.on('change', ({ value }) => {
    yo.update(root, value);
  });

  return {
    element: root,
    update(newCells: Cell[]) {
      cells = newCells;
      debouncedRefreshCurrentCells();
    },
  };

  function cellChanged(cell: Cell) {
    debug('cellChanged', cell.name || '#' + cell.id);
    if ($hidden.value) return;
    debouncedRefreshCurrentCells();
  }

  function refreshCurrentCells() {
    debug('refreshCurrentCells');
    $currentCells.value = discoverAllCells(cells);
  }

  function send(action: string, ...args: any[]) {
    switch (action) {
      case 'toggleHidden':
        $hidden.value = !$hidden.value;
        break;

      case 'zoom':
        $zoom.value = args[0] as number;
        break;

      default:
        throw new Error(`Unknown action "${action}"`);
    }
  }
}

function smartLoading(cb) {
  let isDone = false;
  let triggered = false;

  window.setTimeout(() => {
    if (!isDone) {
      cb(true);
      triggered = true;
    }
  }, 300);

  return {
    done() {
      isDone = true;
      if (triggered) {
        cb(false);
      }
    },
  };
}

function discoverAllCells(cells: Cell[]): Cell[] {
  const seen = {};

  function visit(c: Cell) {
    if (seen[c.id]) return;
    seen[c.id] = c;
    for (const d of c.dependents) {
      visit(d);
    }
    for (const d of c.dependencies) {
      visit(d);
    }
  }

  for (const cell of cells) {
    visit(cell);
  }

  return Object.keys(seen).map(k => seen[k]);
}

function removeChangeListener(cells: Cell[], listener) {
  for (const cell of cells) {
    cell.removeListener('change', listener);
  }
}

function addChangeListener(cells: Cell[], listener) {
  for (const cell of cells) {
    cell.addListener('change', listener);
  }
}

class Timer {
  private handle;

  constructor(private fn, private ms: number) {}

  public stop() {
    if (this.handle) {
      window.clearTimeout(this.handle);
      this.handle = null;
    }
  }

  public start(...args) {
    this.stop();
    this.handle = window.setTimeout(() => {
      this.handle = null;
      this.fn(...args);
    }, this.ms);
  }
}
