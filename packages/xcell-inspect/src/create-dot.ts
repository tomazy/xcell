export type ID = string;
export interface Node {
  id: ID;
  label: string;
  dependents: ID[];
}

function defineNode(node: Node) {
  const { id, label } = node;
  return `  ${id}[label=${label}]`;
}

function defineEdges(node: Node) {
  if (node.dependents.length === 0) {
    return null;
  }

  const ids = node.dependents.join(',');
  return `  ${node.id} -> ${ids};`;
}

export default function createDOT(cells: Node[]): string {
  return (`
digraph {
${
   cells
    .map(defineNode)
    .join('\n')
}
${
  cells
    .map(defineEdges)
    .filter(s => !!s)
    .join('\n')
}
}
  `.trim()
);
}
