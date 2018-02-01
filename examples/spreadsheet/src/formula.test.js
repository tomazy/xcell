/* global test,expect */
/* eslint-disable no-new-func */
import { compile } from './formula'

/*

........................................
:   : A : B :   C    :      D      : E :
:...:...:...:........:.............:...:
: 1 :   :   :        :             :   :
: 2 : 1 : 2 : =A2*B2 :             :   :
: 3 : 3 : 4 : =A3*B3 :             :   :
: 4 : 5 : 6 : =A4*B4 : =SUM(C1:C5) :   :
: 5 :   :   :        :             :   :
:...:...:...:........:.............:...:

*/

test('+', () => {
  const expr = 'A1 + A2 + A3'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('((A1+A2)+A3)')
})

test('-', () => {
  const expr = 'A1 - A2 - A3'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('((A1-A2)-A3)')
})

test('*', () => {
  const expr = 'A1 * A2 * A3'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('((A1*A2)*A3)')
})

test('/', () => {
  const expr = 'A1 / A2 / A3'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('((A1/A2)/A3)')
})

test('>', () => {
  const expr = 'A1 > A2'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2'])
  expect(result.code).toEqual('(A1>A2)')
})

test('>=', () => {
  const expr = 'A1 >= A2'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2'])
  expect(result.code).toEqual('(A1>=A2)')
})

test('<', () => {
  const expr = 'A1 < A2'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2'])
  expect(result.code).toEqual('(A1<A2)')
})

test('<=', () => {
  const expr = 'A1 <= A2'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2'])
  expect(result.code).toEqual('(A1<=A2)')
})

test('=', () => {
  const expr = 'A1 = A2'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2'])
  expect(result.code).toEqual('(A1==A2)')
})

test('*+', () => {
  const expr = 'A1 * A2 + A3'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('((A1*A2)+A3)')
})

test('lowercase', () => {
  const expr = 'a1 * A2 + a3'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('((A1*A2)+A3)')
})

test('SUM', () => {
  const expr = '=SUM(A1:a10)'
  const result = compile(expr)
  expect(result.ranges).toEqual([{ tl: 'A1', br: 'A10' }])
  expect(result.refs).toEqual(['A1_A10'])
  expect(result.code).toEqual('arguments.callee.SUM(A1_A10)')
})

test('IF', () => {
  const expr = '=IF(A1, A2, A3)'
  const result = compile(expr)
  expect(result.ranges).toEqual([])
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('arguments.callee.IF(A1,A2,A3)')
})

test('IF (;)', () => {
  const expr = '=IF(A1; A2; A3)'
  const result = compile(expr)
  expect(result.ranges).toEqual([])
  expect(result.refs).toEqual(['A1', 'A2', 'A3'])
  expect(result.code).toEqual('arguments.callee.IF(A1,A2,A3)')
})

test('cell + a value', () => {
  const expr = 'A1 + 100'
  const result = compile(expr)
  expect(result.refs).toEqual(['A1'])
  expect(result.ranges).toEqual([])
  expect(result.code).toEqual('(A1+100)')
})

test('()', () => {
  expect(compile('(3+4)*5').code).toEqual('((3+4)*5)')
})
