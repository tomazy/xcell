import { EventEmitter } from 'events';

export type Formula<T> = (...args: any[]) => T;
export type EqualFunction = (a: any, b: any) => boolean;

export interface Options<T> {
  value?: any;
  deps?: Cell[];
  formula?: Formula<T>;
  equalFunction?: EqualFunction;
  name?: string; // for inspection
}

export class Cell<T = any> extends EventEmitter {
  private static nextId = 1;

  public name?: string;

  private _dependencies: Cell[] = [];
  private _dependents: Cell[] = [];
  private _formula?: Formula<T>;
  private _value: T;
  private _id: number;
  private _updatingWithoutDependents = false;
  private _disposing = false;
  private _disposed = false;
  private _equalFunction?: EqualFunction;

  constructor(options: Options<T>) {
    super();
    const { value, formula, deps = [], equalFunction, name } = options;
    this._id = Cell.nextId++;
    this.name = name;
    this._value = value;
    this._formula = formula;
    this._equalFunction = equalFunction;
    this.dependencies = deps;
  }

  public dispose() {
    this._disposing = true;
    this.dependencies = [];
    this.removeAllListeners('change');
    this._disposed = true;
  }

  public named(name: string) {
    this.name = name;
    return this;
  }

  public get value(): T {
    return this._value;
  }

  public set value(v: T) {
    if (this._equalFunction) {
      if (this._equalFunction(this._value, v)) {
        return;
      }
    } else if (this._value === v) {
      return;
    }
    const prev = this._value;
    this._value = v;
    this.emit('change', this, prev);
    if (!this._updatingWithoutDependents) {
      this.updateDependents();
    }
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

    this.update();
  }

  public get formula() {
    return this._formula;
  }

  public get disposed() {
    return this._disposed;
  }

  private addDependent(cell: Cell) {
    this._dependents.push(cell);
  }

  private removeDependent(cell: Cell) {
    this._dependents = this._dependents.filter(c => c !== cell);
  }

  private update() {
    if (!this._formula || this._disposing || this._disposed) return;
    const args = this._dependencies.map(d => d.value);
    this.value = this._formula.apply(this, args);
  }

  private updateWithoutDependents() {
    this._updatingWithoutDependents = true;

    this.update();

    this._updatingWithoutDependents = false;
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
      toUpdate[l].updateWithoutDependents();
    }
  }
}

export function createCell<T>(value: T): Cell<T>;
export function createCell<T, U1>(deps: [Cell<U1>], formula: (v1: U1) => T): Cell<T>;
export function createCell<T, U1, U2>(deps: [Cell<U1>, Cell<U2>], formula: (v1: U1, v2: U2) => T): Cell<T>;
export function createCell<T, U1, U2, U3>(deps: [Cell<U1>, Cell<U2>, Cell<U3>], formula: (v1: U1, v2: U2, v3: U3) => T): Cell<T>;
export function createCell<T, U1, U2, U3, U4>(deps: [Cell<U1>, Cell<U2>, Cell<U3>, Cell<U4>], formula: (v1: U1, v2: U2, v3: U3, v4: U4) => T): Cell<T>;
export function createCell<T, U1, U2, U3, U4, U5>(deps: [Cell<U1>, Cell<U2>, Cell<U3>, Cell<U4>, Cell<U5>], formula: (v1: U1, v2: U2, v3: U3, v4: U4, v5: U5) => T): Cell<T>;
export function createCell<T>(deps: Cell[], formula: Formula<T>): Cell<T>;
export function createCell<T>(...args: any[]): Cell<T> {
  let deps, formula, value;

  if (args.length > 1 && typeof args[1] === 'function') {
    deps = args[0];
    formula = args[1];
  } else {
    value = args[0];
  }

  return new Cell<T>({ deps, formula, value });
}
