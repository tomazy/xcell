export type ID = string;
export interface Node {
  id: ID;
  label: string;
  dependents: ID[];
}

function visitNode(node: Node, nodeDefs: string[], edgeDefs: string[]): void {
  const { id, label } = node;
  nodeDefs.push(`  ${id}[label=${label}]`);

  if (node.dependents.length === 0) return;

  const ids = node.dependents.join(',');
  edgeDefs.push(`  ${node.id} -> ${ids};`);
}

export default function createDOT(nodes: Node[]): string {
  const nodeDefs: string[] = [];
  const edgeDefs: string[] = [];
  const seen = {};

  for (const node of nodes) {
    if (seen[node.id]) continue;

    seen[node.id] = true;
    visitNode(node, nodeDefs, edgeDefs);
  }

  const content = [...nodeDefs, ...edgeDefs].join('\n');

  return [
    'digraph {',
    content,
    '}',
  ].join('\n');
}
