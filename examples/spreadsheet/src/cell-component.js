import yo from 'yo-yo'

const debug = require('debug')('xcell:ex:cell-component')

export class CellComponent {
  constructor (sheet, id, onEnterPressed) {
    this._id = id
    this._sheet = sheet
    this._focused = false
    this._dirty = false
    this._onEnterPressed = onEnterPressed
    this._cellChanged = this._cellChanged.bind(this)
    this._setCell(sheet.getCell(id))
  }

  _updateCell (value) {
    this._setCell(this._sheet.setCell(this._id, String(value)))
  }

  _setCell (cell) {
    if (this._cell) {
      this._cell.removeListener('change', this._cellChanged)
    }

    this._cell = cell

    if (this._cell) {
      this._cell.addListener('change', this._cellChanged)
    }
  }

  _cellChanged ({ value }) {
    debug(`cell changed! ${this._id}`, value)
    this._update()
  }

  _createElement () {
    const oninput = (e) => {
      this._dirty = true
    }

    const onblur = (e) => {
      if (this._dirty) {
        this._updateCell(e.target.value)
      }
      this._focused = false
      this._dirty = false
      this._update()
    }

    const onfocus = (e) => {
      this._focused = true
      this._update()
    }

    const onkeypress = (e) => {
      if (e.key === 'Enter') {
        if (this._dirty) {
          this._updateCell(e.target.value)
        }
        this._onEnterPressed(this._id, e.shiftKey)
      }
    }

    const value = this._focused
      ? this._sheet.formulas[this._id] || ''
      : (this._cell
          ? String(this._cell.value)
          : '')

    return yo`
      <input
        id="${this._id}"
        value=${value}
        oninput=${oninput}
        onblur=${onblur}
        onfocus=${onfocus}
        onkeypress=${onkeypress}
      >
    `
  }

  _update () {
    yo.update(this.element, this._createElement())
  }

  get element () {
    return this.el || (this.el = this._createElement())
  }
}
