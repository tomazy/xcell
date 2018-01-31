import yo from 'yo-yo'
import { cellAddressToCoords, coordsToCellAddress } from './sheet'
import { CellComponent } from './cell-component'

/**
 * Creates spreadsheet view
 * @param {number} cols: number of columns
 * @param {number} rows: number of rows
 * @param {Sheet} sheet: sheet
 * @returns {HTMLElement}
 */
export function spreadsheet (cols, rows, sheet) {
  const headers = fill(cols).map((_, i) => String.fromCharCode(0x41 + i))
  const cellComponents = {}

  for (let c = 1; c <= cols; c++) {
    for (let r = 1; r <= rows; r++) {
      const id = getId(c, r)
      cellComponents[id] = new CellComponent(sheet, id, handleEnterPressed)
    }
  }

  return yo`
    <table class="spreadsheet">
      <thead>
        <th>${' '}</th>
        ${headers.map(h => yo`
          <th>${h}</th>
        `)}
      </thead>
      <tbody>
        ${fill(rows).map((_, ri) => yo`
          <tr>
            <td>${ri + 1}</td>
            ${headers.map((col, ci) => yo`
              <td>${cellComp(ci + 1, ri + 1)}</td>
            `)}
          </tr>
        `)}
      </tbody>
    </table>
  `

  function cellComp (col, row) {
    return cellComponents[getId(col, row)].element
  }

  function getId (c, r) {
    return `${headers[c - 1]}${r}`
  }

  function handleEnterPressed (address, shiftKey) {
    const coords = cellAddressToCoords(address)
    let nextAddress
    if (shiftKey) {
      if (coords.row > 1) {
        nextAddress = coordsToCellAddress({ ...coords, row: coords.row - 1 })
      }
    } else {
      if (coords.row < rows) {
        nextAddress = coordsToCellAddress({ ...coords, row: coords.row + 1 })
      }
    }
    if (nextAddress) {
      (window)[nextAddress].focus()
    }
  }
}

function fill (num) {
  return new Array(num).fill(void 0)
}
