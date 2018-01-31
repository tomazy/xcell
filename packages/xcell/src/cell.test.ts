// tslint:disable:no-console
import { createCell as xcell } from './cell';

test('static cell has a value', () => {
  const $a = xcell(123);
  expect($a.value).toEqual(123);
});

test('cells have unique ids', () => {
  const $a = xcell(1);
  const $b = xcell(2);
  expect($a.id).not.toEqual($b.id);
});

test('dynamic cell updates when deps change', () => {
  const $b = xcell(1);
  const $c = xcell(2);
  const $a = xcell([$b, $c], (b, c) => b + c);

  expect($a.value).toEqual(3);

  $b.value = 100;
  expect($a.value).toEqual(102);

  $c.value = 200;
  expect($a.value).toEqual(300);
});

test('dynamic cell without deps', () => {
  const $a = xcell([], () => 123);
  expect($a.value).toEqual(123);
});

test('glitch in diamond', () => {
  /*
      make sure that `d` is not updated with old value of one of the dependencies

            a
          /   \
        b       c
          \   /
            d

  */
  const formula = jest.fn();

  const $a = xcell(1);
  const $b = xcell([$a], a => a + 1);
  const $c = xcell([$a], a => a + 1);
  xcell([$b, $c], formula);

  expect(formula).toHaveBeenCalledTimes(1);
  formula.mockReset();

  $a.value = 5;
  expect(formula).toHaveBeenCalledTimes(1);
  expect(formula).toHaveBeenCalledWith(6, 6);
});

test('static cells emit change events', () => {
  const handler = jest.fn();
  const $a = xcell(1);
  $a.on('change', handler);

  $a.value = 3;
  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledWith($a, 1);
  handler.mockReset();

  $a.value = 3;
  expect(handler).not.toHaveBeenCalled();
});

test('dynamic cell emit change events', () => {
  const handler = jest.fn();

  const $a = xcell(1);
  const $b = xcell(2);
  const $c = xcell([$a, $b], (a, b) => a + b);
  $c.on('change', handler);

  expect(handler).not.toHaveBeenCalled();

  $a.value++;
  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledWith($c, 3);
});

test('dynamic dependencies (range)', () => {
  const $a1 = xcell(1);
  const $a2 = xcell(1);

  const $b1 = xcell(10);
  const $b2 = xcell(10);

  const $all = xcell({
    $a1,
    $a2,
    $b1,
    $b2,
  });

  // select only cells starting with "$a"
  const $rangeDeps = xcell([$all], (o) => (
    Object.keys(o)
      .filter(k => k.slice(0, 2) === '$a')
      .map(k => o[k])
  ));

  const $range = xcell($rangeDeps.value, (...args) => args);
  $rangeDeps.on('change', ({ value }) => {
    // we have to explicitly update the dependencies of the range
    $range.dependencies = value;
  });

  const $sum = xcell([$range], range => sum(...range));
  expect($sum.value).toBe(1 + 1);

  $all.value = {...$all.value, $a3: xcell(1000) };
  expect($sum.value).toBe(1 + 1 + 1000);
});

test('replacing dependencies', () => {
  const $a = xcell(1);
  const $b = xcell(2);
  const $c = xcell(3);
  const $d = xcell(4);

  const $sum = xcell([$a, $b], sum);
  expect($sum.value).toBe(1 + 2);

  const handler = jest.fn();
  $sum.on('change', handler);

  $sum.dependencies = [$c, $d];
  expect($sum.value).toBe(3 + 4);
  expect(handler).toHaveBeenCalledTimes(1);

  $c.value = 33;
  expect($sum.value).toBe(33 + 4);
});

test('disposing cells', () => {
  const $a = xcell(123);
  const $b = xcell([$a], a => a);
  const $c = xcell([$b], b => b);

  const handler = jest.fn();
  $b.on('change', handler);

  $b.dispose();
  expect($b.disposed).toBe(true);
  expect($b.dependencies.length).toBe(0);
  expect($b.listenerCount('change')).toBe(0);
  expect(handler).not.toHaveBeenCalled();

  // The client is responsible to remove the disposed cell
  // from its dependents. So here $b still is a dependency of $c.
  expect($c.dependencies.indexOf($b)).toBeGreaterThan(-1);
});

function sum(...args: number[]) {
  return args.reduce((acc, e) => acc + e, 0);
}
