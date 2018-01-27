import * as vizLite from 'viz.js/viz-lite';
import { parsePlain } from './dot-layout';

const ctx: Worker = self as any;

const fns = {
  vizLite,
  generateDotGraph,
};

function generateDotGraph(digraph: string) {
  const plain: string = vizLite(digraph, {
    format: 'plain',
    totalMemory: 16777216 * 4, // 64MB
  });

  return parsePlain(plain);
}

ctx.addEventListener('message', ({ data }) => {
  const { fn, args, id } = data;

  try {
    const result = fns[fn](...args);
    ctx.postMessage({
      id,
      result,
    });
  } catch (error) {
    ctx.postMessage({
      id,
      error,
    });
  }
});

ctx.postMessage({ message: 'Hello from worker!' });
