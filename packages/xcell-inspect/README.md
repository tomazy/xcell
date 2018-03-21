# xcell-inspect

Inspector for [xcell](https://github.com/tomazy/xcell)

*Browser only*

## Installation

```bash
npm install xcell-inspect
```

## Usage

```html
<script src="https://unpkg.com/xcell"></script>
<script src="https://unpkg.com/xcell-inspect"></script>

<input id="A"> + <input id="B"> = <input id="C" readonly>

<script>
  const $a = xcell(1)
  const $b = xcell(2)
  const $c = xcell([$a, $b], (a, b) => a + b)

  A.value = $a.value
  B.value = $b.value
  C.value = $c.value

  A.addEventListener('input', e => $a.value = +e.target.value)
  B.addEventListener('input', e => $b.value = +e.target.value)

  $c.on('change', ({ value }) => C.value = value)

  const inspector = xcellInspect([$a, $b, $c], {
    renderDOT: true,
    renderGraph: true,
    hidden: false,
  })

  document.body.appendChild(inspector.element)
</script>
```

See it live on JS Bin: [demo](https://jsbin.com/humeqab/edit?output)

