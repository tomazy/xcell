import { defer, Deferred } from './deferred';

// tslint:disable-next-line:no-var-requires
const debug = require('debug')('xcell-inspect:worker-functions');

export function workerFunctions() {
  const WebpackWorker = require('./index.worker');
  const worker = new WebpackWorker();

  let nextId = 1;
  const deferred = {};

  worker.addEventListener('message', ({ data }) => {
    const { id, result, error } = data;
    if (id) {
      const d = deferred[id] as Deferred;
      const elapsed = Date.now() - (d as any).start;
      delete deferred[id];
      debug('Result for id: %d. Waited %dms.', id, elapsed);

      if (error) {
        debug('ERROR!', error);
        d.reject(error);
      } else {
        d.resolve(result);
      }
    }
  });

  function invoke(fn: string, args: any[]) {
    const msg = {
      id: nextId++,
      fn,
      args,
    };

    debug('Invoke `%s`. Id: %d', fn, msg.id);

    worker.postMessage(msg);

    const d = deferred[msg.id] = defer();
    (d as any).start = Date.now();
    return d.promise;
  }

  function generateDotGraph(digraph: string) {
    return invoke('generateDotGraph', [digraph]);
  }

  return {
    generateDotGraph,
  };
}
