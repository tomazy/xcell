import { createCell, Cell } from 'xcell'
import { inspect } from 'xcell-inspect';

/* 1. create the store */
function createStore({ net, taxPercent, tipPercent }) {
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

  return {
    $net,
    $taxPercent,
    $tipPercent,
    $tax,
    $tip,
    $total,
    $gross,
    $extraPercent,
  }
}
const store = createStore({ net: 15, taxPercent: 13, tipPercent: 15 });

/* 2. Connect the inputs and outputs */
connectInput(NET, store.$net)
connectInput(TAX_PERCENT, store.$taxPercent)
connectInput(TIP_PERCENT, store.$tipPercent)

connectOutput(TAX, store.$tax)
connectOutput(TIP, store.$tip)
connectOutput(TOTAL, store.$total)
connectOutput(EXTRA, store.$extraPercent, String)

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

function autoNameCellsForGraph(store) {
  for (let key in store) {
    if (store[key] instanceof Cell) {
      store[key].name = key
    }
  }
}

function extractCellsFromStore(store) {
  const result = [];
  for (let key in store) {
    if (store[key] instanceof Cell) {
      result.push(store[key])
    }
  }
  return result;
}

// connect the debug graph
autoNameCellsForGraph(store);
document.body.appendChild(inspect(extractCellsFromStore(store), { renderGraph: true, renderDOT: false }))
