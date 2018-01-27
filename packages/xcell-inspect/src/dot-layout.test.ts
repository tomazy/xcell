import { parsePlain } from './dot-layout';

test('graph', () => {
  const plain = `
graph 1 3.614 4.5
stop
`.trim();

  const graph = parsePlain(plain);

  expect(graph.scale).toEqual(1);
  expect(graph.width).toEqual(3.614);
  expect(graph.height).toEqual(4.5);
});

test('node - simple', () => {
  const plain = `
graph 1 10 10
node 123 1 2 3 4 ABC solid box red yellow
stop
`.trim();

  const parsed = parsePlain(plain);
  expect(parsed.nodes.length).toEqual(1);

  const [node] = parsed.nodes;

  expect(node.x).toEqual(1);
  expect(node.y).toEqual(10 - 2);
  expect(node.width).toEqual(3);
  expect(node.height).toEqual(4);
  expect(node.id).toEqual('123');
  expect(node.label).toEqual('ABC');
  expect(node.style).toEqual('solid');
  expect(node.shape).toEqual('box');
  expect(node.color).toEqual('red');
  expect(node.fillColor).toEqual('yellow');
});

test('node - quotes', () => {
  const plain = `
graph 1 3.614 4.5
node 123 1.2181 4.25 1.6474 0.5 "tax rate: 0.13" solid ellipse black lightgrey
stop
`.trim();

  const parsed = parsePlain(plain);
  const [node] = parsed.nodes;

  expect(node.id).toEqual('123');
  expect(node.label).toEqual('tax rate: 0.13');
  expect(node.style).toEqual('solid');
  expect(node.shape).toEqual('ellipse');
  expect(node.color).toEqual('black');
  expect(node.fillColor).toEqual('lightgrey');
});

test('node - quotes in quotes', () => {
  const plain = `
graph 1 3.614 4.5
node 123 1.2181 4.25 1.6474 0.5 "tax rate: \\"0.13\\"" solid ellipse black lightgrey
stop
`.trim();

  const parsed = parsePlain(plain);
  const [node] = parsed.nodes;

  expect(node.id).toEqual('123');
  expect(node.label).toEqual('tax rate: "0.13"');
  expect(node.style).toEqual('solid');
  expect(node.shape).toEqual('ellipse');
  expect(node.color).toEqual('black');
  expect(node.fillColor).toEqual('lightgrey');
});

test('node - fix coords', () => {
  const graphH = 4.5;
  const plain = `
graph 1 3.614 ${graphH}
node 123 1.2181 4.25 1.6474 0.5 "tax rate: 0.13" solid ellipse black lightgrey
stop
`.trim();

  const parsed = parsePlain(plain);
  const [node] = parsed.nodes;

  expect(node.x).toEqual(1.2181);
  expect(node.y).toEqual(graphH - 4.25);
  expect(node.width).toEqual(1.6474);
  expect(node.height).toEqual(.5);
});

test('edge - fix coords', () => {
  const graphH = 4.5;
  const plain = `
graph 1 3.614 ${graphH}
edge A B 7 2.9014 3.9961 2.8487 3.7434 2.765 3.3447 2.6903 3 2.6649 2.8827 2.6367 2.7551 2.6109 2.6391 solid black
stop
`.trim();

  const parsed = parsePlain(plain);
  expect(parsed.edges.length).toEqual(1);
  const [edge] = parsed.edges;

  expect(edge.head).toEqual('B');
  expect(edge.tail).toEqual('A');
  expect(edge.points.length).toEqual(7);
  expect(edge.style).toEqual('solid');
  expect(edge.color).toEqual('black');
});
