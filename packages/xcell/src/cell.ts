import { EventEmitter } from 'events';
export type Formula = (...args: any[]) => any;

export interface Options {
  value: any;
  deps?: Cell[];
  formula?: Formula;
}

export class Cell extends EventEmitter {
  private static nextId = 1;
  private _dependencies: Cell[] = [];
  private _dependents: Cell[] = [];
  private _formula?: Formula;
  private _value: any;
  private _id: number;
  private _updating = false;

  constructor(options: Options) {
    super();
    const { value, formula, deps = [] } = options;
    this._id = Cell.nextId++;
    this._value = value;
    this._formula = formula;

    this.dependencies = deps;
  }

  public dispose() {
    for (const d of this._dependents) {
      d.dependencies = d.dependencies.filter(c => c !== this);
    }
    this.dependencies = [];
    this.removeAllListeners('change');
  }

  public get value() {
    return this._value;
  }

  public set value(v) {
    if (this._value === v) return;
    const prev = this._value;
    this._value = v;
    if (!this._updating) {
      this.updateDependents();
    }
    this.emit('change', this, prev);
  }

  public get id() {
    return this._id;
  }

  public get dependents() {
    return [...this._dependents];
  }

  public get dependencies() {
    return [...this._dependencies];
  }

  public set dependencies(v) {
    for (const d of this._dependencies) {
      d.removeDependent(this);
    }

    this._dependencies = [...v];

    for (const d of this._dependencies) {
      d.addDependent(this);
    }

    if (this._formula) {
      this.update();
    }
  }

  private addDependent(cell: Cell) {
    this._dependents.push(cell);
  }

  private removeDependent(cell: Cell) {
    this._dependents = this._dependents.filter(c => c !== cell);
  }

  private update() {
    if (!this._formula) return;
    this._updating = true;
    const args = this._dependencies.map(d => d.value);
    this.value = this._formula.apply(this, args);
    this._updating = false;
  }

  private updateDependents() {
    // depth-first search in DAG guarantees topological sort order
    const seen = {};
    const processed = {};
    const toUpdate: Cell[] = [];
    const stack: Cell[] = [this];
    seen[this.id] = true;

    while (stack.length > 0) {
      const c = stack[stack.length - 1]; // peek
      if (processed[c.id]) {
        const x = stack.pop() as Cell;
        if (x !== this) {
          toUpdate.push(x);
        }
      } else {
        for (const d of c._dependents) {
          if (!seen[d.id]) {
            seen[d.id] = true;
            stack.push(d);
          }
        }
        processed[c.id] = true;
      }
    }

    let l = toUpdate.length;
    while (l--) {
      toUpdate[l].update();
    }
  }
}

export function createCell(value: any): Cell;
export function createCell(deps: Cell[], formula: Formula): Cell;
export function createCell(...args: any[]): Cell {
  let deps, formula, value;

  if (args.length > 1 && typeof args[1] === 'function') {
    deps = args[0];
    formula = args[1];
  } else {
    value = args[0];
  }

  return new Cell({ deps, formula, value });
}
