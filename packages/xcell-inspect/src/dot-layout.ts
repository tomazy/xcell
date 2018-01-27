export type ID = string;

export interface DotGraph {
  scale: number;
  width: number;
  height: number;
  nodes: DotNode[];
  edges: DotEdge[];
}

export interface DotNode {
  id: ID;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  style: string;
  shape: string;
  color: string;
  fillColor: string;
}

export interface DotPoint {
  x: number;
  y: number;
}

export interface DotEdge {
  tail: string;
  head: string;
  points: DotPoint[];
  label?: string;
  labelPosition?: DotPoint;
  style: string;
  color: string;
}

export interface DotDiff {
  added: ID[];
  changed: ID[];
}

function unquote(s: string): string {
  if (s[0] === '"' && s[s.length - 1] === '"') {
    return JSON.parse(s);
  } else {
    return s;
  }
}

function tokenize(line: string): string[] {
  return (line.match(/"(\\.|[^"])*"|\S+/g) || [])
    .map(unquote);
}

export function parsePlain(input: string): DotGraph {
  const lines = input.split('\n');

  let result: DotGraph = {
    edges: [],
    nodes: [],
    height: 0,
    width: 0,
    scale: 1,
  };

  function translatePosition(p: DotPoint): DotPoint {
    return {
      x: p.x,
      y: result.height - p.y,
    };
  }

  function parseGraphLine(line: string) {
    const [, scale, width, height] = tokenize(line);
    result = {
      ...result,
      scale: parseFloat(scale),
      width: parseFloat(width),
      height: parseFloat(height),
    };
  }

  function parseNodeLine(line: string) {
    // node a 1.375 2.25 0.75 0.5 a solid ellipse black lightgrey
    // 0    1 2     3    4    5   6 7     8       9     10
    const [, id, x, y, w, h, label, style, shape, color, fillColor] = tokenize(line);
    const p = translatePosition({ x: parseFloat(x), y: parseFloat(y)});
    const node: DotNode = {
      ...p,
      id,
      width: parseFloat(w),
      height: parseFloat(h),
      label,
      style,
      shape,
      color,
      fillColor,
    };
    result.nodes.push(node);
  }

  function parseEdgeLine(line: string) {
    const terms = tokenize(line);
    const [, tail, head, n] = terms;
    const points: DotPoint[] = [];

    let index = 4;
    let pointsCount = Number(n);

    while (pointsCount--) {
      const x = Number(terms[index++]);
      const y = Number(terms[index++]);
      points.push( translatePosition({ x, y }));
    }

    const style = terms[index++];
    const color = terms[index++];

    result.edges.push({
      head,
      tail,
      points,
      style,
      color,
    });
  }

  function parseLine(line: string) {
    if (line === 'stop') {
      return;
    } else if (startsWith(line, 'graph')) {
      parseGraphLine(line);
    } else if (startsWith(line, 'node')) {
      parseNodeLine(line);
    } else if (startsWith(line, 'edge')) {
      parseEdgeLine(line);
    }
  }

  for (let i = 0, l = lines.length; i < l; i++) {
    parseLine(lines[i]);
  }

  return result;
}

export function diffNodes(a: DotGraph, b: DotGraph): DotDiff {
  const added: string[] = [];
  const changed: string[] = [];

  if (b && a) {
    b.nodes.forEach(bn => {
      let an: DotNode | undefined;
      if (an = a.nodes.find(n => n.id === bn.id)) {
        if (an.label !== bn.label) {
          changed.push(bn.id);
        }
      } else {
        added.push(bn.id);
      }
    });
  }

  return {
    added,
    changed,
  };
}

function startsWith(hay: string, needle: string) {
  return hay.substr(0, needle.length) === needle;
}
