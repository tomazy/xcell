import { Cell, createCell } from './cell';

(createCell as any).Cell = Cell;

export = createCell;
