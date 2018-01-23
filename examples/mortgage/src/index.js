import { createSheet } from './mortgage';
import yo from 'yo-yo';
import raf from 'raf';
import formatDate from 'date-fns/format'
import parseDate from 'date-fns/parse'

const sheet = createSheet({
  loanAmount: 200000,
  rate: 1.2,
  loanDate: new Date(),
  loanTermYears: 10,
})

function input(cell, attrs = {}) {
  return yo`
    <input value="${format(cell.value)}" oninput=${oninput} ${attrs}>
  `

  function oninput(e) {
    cell.value = parse(e.target.value)
  }

  function parse(v) {
    switch (attrs.type) {
      case 'date':
        return /^\d{4}-\d{2}-\d{2}$/.test(v)
          ? parseDate(v)
          : null

      case 'number':
        return Number(v)

      default:
        return '' + v
    }
  }

  function format(v) {
    switch (attrs.type) {
      case 'date':
        return Boolean(v)
          ? formatDate(v, 'YYYY-MM-DD')
          : ''

      case 'number':
        return String(v)

      default:
        return '' + v
    }
  }
}

function form() {
  return yo`
    <form>
      <table>
        <tr>
          <td>Loan amount:</td>
          <td>
            ${input(sheet.$loanAmount, { type: 'number', min: 1, max: 9000000 })}$
          </td>
        </tr>
        <tr>
          <td>Interest rate:</td>
          <td>
            ${input(sheet.$rate, { type: 'number', step: 0.1, min: 0, max: 100 })}%
          </td>
        </tr>
        <tr>
          <td>Loan term:</td>
          <td>
            ${input(sheet.$loanTermYears, { type: 'number', step: 1, min: 1, max: 40 })} years
          </td>
        </tr>
        <tr>
          <td>Loan date:</td>
          <td>
            ${input(sheet.$loanDate, { type: 'date', placeholder: 'YYYY-MM-DD' })}
          </td>
        </tr>
        <tr>
          <td>Total interest to pay:</td>
          <td><b>${formatMoney(sheet.$interestSum.value)}</b></td>
        </tr>
        <tr>
          <td>Total:</td>
          <td><b>${formatMoney(sheet.$amountSum.value)}</b></td>
        </tr>
      </table>
    </form>
  `
}

function installments() {
  const items = sheet.$installments.value;
  if (!items.length) { return null }
  return yo`
    <div class="table-responsive">
      <table class="installments">
        <caption>Monthly payments</caption>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Interest</th>
            <th>Principal</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
        ${items.map(ii => (
          yo`
          <tr>
            <td class="text-right">
              ${ii.idx + 1}
            </td>
            <td>
              ${formatDate(ii.$date.value, 'YYYY-MM-DD')}
            </td>
            <td class="text-right">
              ${formatMoney(ii.$interest.value)}
            </td>
            <td class="text-right">
              ${formatMoney(ii.$principal.value)}
            </td>
            <td class="text-right">
              ${formatMoney(ii.$amount.value)}
            </td>
          </tr>
          `
        ))}
        </tbody>
      </table>
    </div>
  `
}

function app() {
  return yo`
  <div>
    <h1>Mortgage calculator</h1>
    ${form()}
    <hr />
    ${installments()}
  </div>`;
}

const root = document.body.appendChild(document.createElement('div'))
render();
watchSheet();

function render() {
  if (render._raf) {
    return;
  }
  render._raf = raf(() => {
    const a = app()
    yo.update(root, a)
    delete render._raf
  })
}

function watchSheet() {
  Object.keys(sheet).forEach(key => {
    if (typeof sheet[key].on === 'function') {
      sheet[key].on('change', render)
    }
  })
}

function formatMoney(v) {
  return Number.isFinite(v)
    ? `$${v.toFixed(2)}`
    : '?'
}
