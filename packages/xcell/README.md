# xcell

Tiny library for building reactive spreadsheet-like calculations in JavaScript.

## installation

```bash
npm install xcell
```

## usage (node)

```javascript
const assert = require('assert')
const { createCell } = require('xcell')

const $a = createCell(1)
const $b = createCell(2)
const $c = createCell([$a, $b], (a, b) => a + b)

$a.value = 100
assert.equals($c.value, 102) // 100 + 2

$b.value = 200
assert.equals($c.value, 300) // 100 + 200
```

A `Cell` implements `EventEmitter` interface:

```javascript
$c.on('change', ({ value }) => console.log(value))
```

## usage (browser)

```html
<input id="A"> + <input id="B"> = <input id="C" readonly>
<script>
  const { createCell } = xcell;

  const $a = createCell(1)
  const $b = createCell(2)
  const $c = createCell([$a, $b], (a, b) => a + b)

  A.value = $a.value
  B.value = $b.value
  C.value = $c.value

  A.addEventListener('input', e => $a.value = +e.target.value)
  B.addEventListener('input', e => $b.value = +e.target.value)

  $c.on('change', ({ value }) => C.value = value)
</script>
```

## license

MIT
