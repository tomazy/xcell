function IF (condition, trueValue, elseValue) {
  return condition ? trueValue : elseValue
}

function ROUND (number, precision = 0) {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

function SUM (arr) {
  return (
    arr
      .filter(validNumber)
      .reduce((a, b) => a + b, 0)
  )
}

function AVERAGE (arr) {
  const sumCount = arr
    .filter(validNumber)
    .reduce((acc, e) => ({sum: acc.sum + e, count: acc.count + 1}), { sum: 0, count: 0 })
  return (sumCount.count === 0)
    ? '#DIV/0!'
    : sumCount.sum / sumCount.count
}

function MIN (...args) {
  const arr = (args.length > 1)
    ? args
    : args[0]
  return (
    arr.length > 0
      ? arr
        .filter(validNumber)
        .reduce((acc, e) => e < acc ? e : acc)
      : 0
  )
}

function MAX (...args) {
  const arr = (args.length > 1)
    ? args
    : args[0]
  return (
    arr.length > 0
      ? arr
        .filter(validNumber)
        .reduce((acc, e) => e > acc ? e : acc)
      : 0
  )
}

function COUNT (arr) {
  return (
    arr
      .filter(validNumber)
      .length
  )
}

export const functions = {
  AVERAGE,
  COUNT,
  IF,
  MAX,
  MIN,
  ROUND,
  SUM
}

function validNumber (n) {
  return (typeof n === 'number') && Number.isFinite(n)
}
