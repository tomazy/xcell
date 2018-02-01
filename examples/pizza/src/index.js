import xcell, { Cell } from 'xcell'
import inspect from 'xcell-inspect'

/* 1. create the store */
function createStore({ menuPrice, taxPercent, tipPercent }) {
  const $menuPrice = xcell(menuPrice)
  const $taxPercent = xcell(taxPercent)
  const $tipPercent = xcell(tipPercent)
  const $tax = xcell(
    [$menuPrice, $taxPercent],
    (menuPrice, taxPercent) => menuPrice * taxPercent / 100,
  )
  const $gross = xcell(
    [$menuPrice, $tax],
    (menuPrice, tax) => menuPrice + tax,
  )
  const $tip = xcell(
    [$gross, $tipPercent],
    (gross, tipPercent) => gross * tipPercent / 100,
  )
  const $total = xcell(
    [$gross, $tip],
    (gross, tip) => gross + tip,
  )
  const $extraPercent = xcell(
    [$menuPrice, $total],
    (menuPrice, total) => (total > menuPrice)
      ? Math.round(((total - menuPrice) / menuPrice) * 100)
      : 0
  )

  return {
    $menuPrice,
    $taxPercent,
    $tipPercent,
    $tax,
    $tip,
    $total,
    $gross,
    $extraPercent,
  }
}
const store = createStore({ menuPrice: 15, taxPercent: 13, tipPercent: 15 });

/* 2. Connect the inputs and outputs */
connectInput(NET, store.$menuPrice)
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
const inspector = inspect(extractCellsFromStore(store), {
  renderGraph: true,
  renderDOT: false,
  hidden: (window.innerWidth < 900) || (window.innerHeight < 700)
 })
document.body.appendChild(inspector.element)
