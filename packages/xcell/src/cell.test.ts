// tslint:disable:no-console
import { createCell } from './cell';

test('static cell has a value', () => {
  const $a = createCell(123);
  expect($a.value).toEqual(123);
});

test('cells have unique ids', () => {
  const $a = createCell(1);
  const $b = createCell(2);
  expect($a.id).not.toEqual($b.id);
});

test('dynamic cell updates when deps change', () => {
  const $b = createCell(1);
  const $c = createCell(2);
  const $a = createCell([$b, $c], (b, c) => b + c);

  expect($a.value).toEqual(3);

  $b.value = 100;
  expect($a.value).toEqual(102);

  $c.value = 200;
  expect($a.value).toEqual(300);
});

test('dynamic cell without deps', () => {
  const $a = createCell([], () => 123);
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

  const $a = createCell(1);
  const $b = createCell([$a], a => a + 1);
  const $c = createCell([$a], a => a + 1);
  const $d = createCell([$b, $c], formula);

  expect(formula).toHaveBeenCalledTimes(1);
  formula.mockReset();

  $a.value = 5;
  expect(formula).toHaveBeenCalledTimes(1);
  expect(formula).toHaveBeenCalledWith(6, 6);
});

test('static cells emit change events', () => {
  const handler = jest.fn();
  const $a = createCell(1);
  $a.on('change', handler);

  $a.value = 3;
  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledWith($a);
  handler.mockReset();

  $a.value = 3;
  expect(handler).not.toHaveBeenCalled();
});

test('dynamic cell emit change events', () => {
  const handler = jest.fn();

  const $b = createCell(1);
  const $c = createCell(2);
  const $a = createCell([$b, $c], (b, c) => b + c);
  $a.on('change', handler);

  expect(handler).not.toHaveBeenCalled();

  $b.value++;
  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenCalledWith($a);
});
