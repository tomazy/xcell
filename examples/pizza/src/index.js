import xcell, { Cell } from 'xcell'
import inspect from 'xcell-inspect'

import 'tachyons/css/tachyons.min.css'
import './style.css'

/* 1. create the cells */
/**
 * Creates directional graph of the data with provided defaults.
 * @param {Object} defaults
 * @param {number} defaults.menuPrice
 * @param {number} defaults.menuPrice
 * @param {number} defaults.taxPercent
 * @param {number} defaults.tipPercent
 */
function createCells({ menuPrice, taxPercent, tipPercent }) {
  const $menuPrice  = xcell(menuPrice)
  const $taxPercent = xcell(taxPercent)
  const $tipPercent = xcell(tipPercent)

  const $tax = xcell(
    [$menuPrice, $taxPercent],
    ( menuPrice,  taxPercent) => menuPrice * taxPercent / 100,
  )

  const $gross = xcell([$menuPrice, $tax], add)

  const $tip = xcell(
    [$gross, $tipPercent],
    ( gross,  tipPercent) => gross * tipPercent / 100,
  )

  const $total = xcell([$gross, $tip], add)

  return {
    $menuPrice,
    $taxPercent,
    $tipPercent,
    $tax,
    $tip,
    $gross,
    $total,
  }
}
const cells = createCells({ menuPrice: 15, taxPercent: 13, tipPercent: 15 });

/* 2. Connect the inputs and outputs */
connectInput(MENU_PRICE, cells.$menuPrice)
connectInput(TAX_PERCENT, cells.$taxPercent)
connectInput(TIP_PERCENT, cells.$tipPercent)

connectOutput(TAX, cells.$tax)
connectOutput(TIP, cells.$tip)
connectOutput(GROSS, cells.$gross)
connectOutput(TOTAL, cells.$total)

//#region --- helpers ---
/**
 * @param {Element} input
 * @param {Cell} cell
 * @param {(string) => any} parse
 */
function connectInput(input, cell, parse = Number) {
  input.value = cell.value
  input.addEventListener('change', ev => {
    cell.value = parse(ev.target.value)
  })
}

/**
 * @param {Element} output
 * @param {Cell} cell
 * @param {(any) => string} format
 */
function connectOutput(output, cell, format = formatMoney) {
  output.textContent = format(cell.value)
  cell.on('change', ({ value }) => {
    output.textContent = format(value)
  })
}

/**
 * @param {number} x
 * @param {number} y
 */
function add(x, y) {
  return x + y
}

/**
 * @param {number} value
 */
function formatMoney(value) {
  return value.toFixed(2)
}
//#endregion

//#region --- inspector ---
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
// connect the debug inspector
autoNameCellsForGraph(cells);
const inspector = inspect(extractCellsFromStore(cells), {
  renderGraph: true,
  renderDOT: false,
  hidden: (window.innerWidth < 900) || (window.innerHeight < 700)
 })
document.body.appendChild(inspector.element)
//#endregion
