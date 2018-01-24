import { createSheet } from './mortgage';
import yo from 'yo-yo';
import requestAnimationFrame from 'raf';
import formatDate from 'date-fns/format'
import parseDate from 'date-fns/parse'

const sheet = createSheet({
  loanAmount: 200000,
  rate: 1.2,
  loanDate: new Date(),
  loanTermYears: 20,
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

function output(cell, format) {
  cell.on('change', cellChanged);

  return yo`<span data-cell-id="${cell.id}">${format(cell.value)}</span>`;

  function cellChanged({id, value}) {
    const el = document.querySelector(`[data-cell-id="${id}"]`)
    el.textContent = format(value)
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
          <td><b>${output(sheet.$interestSum, formatMoney)}</b></td>
        </tr>
        <tr>
          <td>Total to pay:</td>
          <td><b>${output(sheet.$amountSum, formatMoney)}</b></td>
        </tr>
      </table>
    </form>
  `
}

function installments($installments) {
  const element = renderInstallments($installments.value);

  $installments.on('change', ({ value }) => {
    yo.update(element, renderInstallments(value))
  })

  return element;

  function renderInstallments(items) {
    return yo`
      <div class="table-responsive">
        ${
          items.length
            ? yo`
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
                    ${output(ii.$date, _formatDate)}
                  </td>
                  <td class="text-right">
                    ${output(ii.$interest, formatMoney)}
                  </td>
                  <td class="text-right">
                    ${output(ii.$principal, formatMoney)}
                  </td>
                  <td class="text-right">
                    ${output(ii.$amount, formatMoney)}
                  </td>
                </tr>
                `
              ))}
              </tbody>
            </table>`
            : null
        }
      </div>
    `
  }

  function _formatDate(date) {
    return formatDate(date, 'YYYY-MM-DD')
  }
}

function app() {
  return yo`
    <div>
      <h1>Mortgage calculator</h1>
      ${form()}
      <hr />
      ${installments(sheet.$installments)}
    </div>`;
}

document.body.appendChild(app())

function formatMoney(v) {
  return Number.isFinite(v)
    ? `$${v.toFixed(2)}`
    : '?'
}
