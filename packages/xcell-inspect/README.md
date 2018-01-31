# xcell-inspect

Inspector for [xcell](https://github.com/tomazy/xcell)

*Browser only*

## Installation

```bash
npm install xcell-inspect
```

## Usage

```html
<script src="https://unpkg.com/xcell@latest/dist/xcell-umd.js"></script>
<script src="https://unpkg.com/xcell-inspect@latest/dist/xcell-inspect-umd.js"></script>
<script>
const xcell = require('xcell')
const inspect = require('xcell-inspect')

const $a = xcell(1)
const $b = xcell(2)
const $c = xcell([$a, $b], (a, b) => a + b)

const inspector = inspect([$a, $b, $c], {
  renderDOT: true,
  renderGraph: true,
  hidden: false,
})

document.body.appendChild(inspector.element)
</script>


```

