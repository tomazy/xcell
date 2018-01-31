import { Cell } from 'xcell'
import shallowEqual from 'shallowequal'
import assert from 'assert'
import { EventEmitter } from 'events'
import { compileFormula } from './compile-formula'

const debug = require('debug')('xcell:ex:sheet')

const RANGE_ADDRESS_RE = /^([A-Z]+\d+)_([A-Z]+\d+)$/
const CELL_ADDRESS_RE = /^[A-Z]\d+$/

export class Sheet extends EventEmitter {
  constructor () {
    super()

    this.$cells = new Cell({
      value: {},
      equalFunction: shallowEqual,
      name: 'ALL'
    })

    this.ranges = {}
    this.formulas = {}
  }

  /**
   * @param {string} id
   * @returns {Cell}
   */
  getCell (id) {
    return this.cells[id]
  }

  /**
   * @returns {Cell[]}
   */
  getCells () {
    return Object.keys(this.cells)
      .map(id => this.getCell(id))
      .filter(cell => !!cell)
  }

  /**
   * @private
   * @param {string} id
   * @param {string} formula
   * @returns {Cell}
   */
  createCellWithFormula (id, formula) {
    debug(`createCellWithFormula(${id}, ${formula})`)
    assert.equal(formula[0], '=', 'Formula must start with "="')

    const func = compileFormula(formula)
    let deps = []
    if (func.refs) {
      deps = func.refs.map(ref => (
        isRangeAddress(ref)
          ? this.ensureRange(ref)
          : this.ensureCellNode(ref)
      ))
    }
    return new Cell({
      name: id,
      deps,
      formula: func
    })
  }

  /**
   * @private
   * @param {string} begin
   * @param {string} end
   * @returns {Cell}
   */
  createRange (begin, end) {
    const inRange = isInRange.bind(undefined, begin, end)

    // $rangeDeps depends on $cells and
    // generates array of all the cells
    // in the given range.
    const $rangeDeps = new Cell({
      name: `${begin}:${end} - deps`,
      deps: [this.$cells],
      formula: (cells) => (
        Object.keys(cells)
          .filter(inRange)
          .map(key => cells[key])
          .filter(n => !!n)
      )
    })

    // $range depends on the cells generated above
    const $range = new Cell({
      equalFunction: shallowEqual,
      name: `${begin}:${end}`,
      deps: $rangeDeps.value,
      formula: (...args) => args
    })
    $range.on('change', ({ name, value }) => {
      debug(`range "${name}" changed`, value)
    })

    // whenever $rangeDeps changes, we update the dependencies
    // of the $range
    $rangeDeps.on('change', ({ name, value }) => {
      debug(`rangeHelper "${name}" changed`)
      $range.dependencies = value
    })

    $range.$rangeDeps = $rangeDeps

    return $range
  }

  /**
   * @param {string} id
   * @param {string} content
   * @returns {Cell}
   */
  setCell (id, content) {
    debug(`setValue(${id}, ${content})`)
    content = content.trim()

    const previous = this.getCell(id)

    if ((this.formulas[id] === content) || (content === '' && this.formulas[id] === undefined)) {
      return previous
    }

    let current

    if (content === '') {
      delete this.formulas[id]

      if (previous && previous.dependents.length > 0) {
        current = new Cell({
          value: '',
          name: id
        })
      } else {
        current = undefined
      }
    } else if (content[0] === '=') {
      this.formulas[id] = content
      current = this.createCellWithFormula(id, content)
    } else {
      this.formulas[id] = content
      const floatValue = parseFloat(content)
      const value = String(floatValue) === content ? floatValue : content
      if (previous && !previous.formula) {
        previous.value = value
        current = previous
      } else {
        current = new Cell({
          name: id,
          value
        })
      }
    }

    if (current !== previous) {
      this.cells = Object.assign({}, this.cells, { [id]: current })
      if (previous) {
        if (current) {
          const dependents = previous.dependents.slice()
          // replace dependency
          for (const dep of dependents) {
            dep.dependencies = dep.dependencies.map(
              d => d === previous ? current : d
            )
          }
        }

        previous.dispose()
      }
      this.gcCells()
      this.gcRanges()
    }

    this.emit('update')

    return current
  }

  /**
   * @private
   */
  get cells () {
    return this.$cells.value
  }

  /**
   * @private
   */
  set cells (value) {
    this.$cells.value = value
  }

  /**
   * @private
   */
  ensureCellNode (id) {
    const result = this.getCell(id)
    if (result) { return result }

    const cell = new Cell({ name: id, value: '' })
    this.cells = Object.assign({}, this.cells, { [id]: cell })
    return cell
  }

  /**
   * @private
   */
  ensureRange (address) {
    const result = this.ranges[address]
    if (result) {
      return result
    }
    const [, rangeBegin, rangeEnd] = RANGE_ADDRESS_RE.exec(address)
    return (this.ranges[address] = this.createRange(rangeBegin, rangeEnd))
  }

  /**
   * @private
   */
  gcCells () {
    const toDispose = []
    const keysToDelete = []

    Object.keys(this.cells).forEach(addr => {
      const cell = this.cells[addr]
      if (!cell) {
        keysToDelete.push(addr)
      } else if (cell.dependents.length === 0) {
        if (cell.value === '' && typeof cell.formula !== 'function') {
          toDispose.push(cell)
          keysToDelete.push(addr)
        }
      }
    })

    if (keysToDelete.length > 0) {
      const cells = Object.assign({}, this.cells)
      keysToDelete.forEach(key => delete cells[key])
      this.cells = cells
    }

    toDispose.forEach(cell => cell.dispose())
  }

  /**
   * @private
   */
  gcRanges () {
    Object.keys(this.ranges).forEach(addr => {
      const cell = this.ranges[addr]
      if (cell.dependents.length === 0) {
        cell.$rangeDeps.dispose()
        cell.$rangeDeps = null
        cell.dispose()
        delete this.ranges[addr]
      }
    })
  }
}

function isRangeAddress (address) {
  return RANGE_ADDRESS_RE.test(address)
}

const LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'].join('')

export function cellAddressToCoords (addr) {
  return {
    col: LETTERS.indexOf(addr[0]) + 1,
    row: parseInt(addr.substr(1), 10)
  }
}

export function coordsToCellAddress (coords) {
  return `${LETTERS[coords.col - 1]}${coords.row}`
}

function isCellAddress (address) {
  return CELL_ADDRESS_RE.test(address)
}

function isInRange (begin, end, value) {
  if (!isCellAddress(value)) {
    return false
  }
  const b = cellAddressToCoords(begin)
  const e = cellAddressToCoords(end)
  const v = cellAddressToCoords(value)
  return (v.col >= b.col) && (v.col <= e.col) &&
    (v.row >= b.row) && (v.row <= e.row)
}
