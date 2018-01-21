import { createCell } from 'xcell'

/* 1. create the calculation */
const $net = createCell(15)
const $taxPercent = createCell(13)
const $tipPercent = createCell(15)
const $tax = createCell(
  [$net, $taxPercent],
  (net, taxPercent) => net * taxPercent / 100,
)
const $gross = createCell(
  [$net, $tax],
  (net, tax) => net + tax,
)
const $tip = createCell(
  [$gross, $tipPercent],
  (gross, tipPercent) => gross * tipPercent / 100,
)
const $total = createCell(
  [$gross, $tip],
  (gross, tip) => gross + tip,
)
const $extraPercent = createCell(
  [$net, $total],
  (net, total) => (total > net)
    ? Math.round(((total - net) / net) * 100)
    : 0
)

/* 2. Connect the inputs and outputs */
connectInput(NET, $net)
connectInput(TAX_PERCENT, $taxPercent)
connectInput(TIP_PERCENT, $tipPercent)

connectOutput(TAX, $tax)
connectOutput(TIP, $tip)
connectOutput(TOTAL, $total)
connectOutput(EXTRA, $extraPercent, String)

/* -- helpers -- */
function connectInput(input, cell, parse = Number) {
  input.value = cell.value
  input.addEventListener('input', ev => {
    cell.value = parse(ev.target.value)
  })
}

function connectOutput(output, cell, format = formatMoney) {
  output.textContent = format(cell.value)
  cell.on('change', ({ value }) => {
    output.textContent = format(value)
  })
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`
}
