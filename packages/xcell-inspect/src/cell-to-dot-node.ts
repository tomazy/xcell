import { Cell } from 'xcell';
import { Node } from './create-dot';

export default function cell2node(cell: Cell): Node {
  const { id, name, value, dependents } = cell;
  const label = JSON.stringify(`${name || '#' + id}: ${valueToString(value)}`);
  return {
    id: String(id),
    label,
    dependents: dependents.map(d => String(d.id)),
  };
}

function valueToString(value: any): string {
  if (value === undefined) {
    return '??';
  } else if (typeof value === 'string') {
    if (value.length > 25) {
      return JSON.stringify(`${value.slice(0, 25)}...`);
    }
    return JSON.stringify(value);
  } else if (typeof value === 'number') {
    if (isInt(value)) {
      return String(value);
    } else {
      return value.toPrecision(8).replace(/0+$/, '');
    }
  } else if (typeof value === 'function') {
    return `ƒ ${value.name || 'anonymous'}()`;
  } else if (Array.isArray(value)) {
    return `Array(${value.length})`;
  } else {
    return value.toString().substring(0, 25);
  }
}

function isInt(value: number) {
  if (isNaN(value)) {
    return false;
  }
  // tslint:disable-next-line:no-bitwise
  return (value | 0) === value;
}
