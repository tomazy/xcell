import differenceInDays from 'date-fns/difference_in_days'
import xcell, { Cell } from 'xcell'

import {
  getInstallmentDate,
  getInstallmentInterest,
  getMonthlyPayment,
  minus,
  plus,
  sum,
  identity,
} from "./utils";

class Installment {
  dispose() {
    for (let key in this) {
      if (this[key] instanceof Cell) {
        this[key].dispose();
      }
    }
  }
}

export function createStore({ loanAmount, rate, loanDate, loanTermYears = 30 }) {
  const $rate = xcell(rate)
  const $loanAmount = xcell(loanAmount)
  const $loanTermYears = xcell(loanTermYears)
  const $loanTermMonths = xcell([$loanTermYears], x => x * 12)
  const $loanDate = xcell(loanDate)

  const $installments = xcell(
    [$loanTermMonths, $loanDate, $loanAmount],
    ( loanTermMonths,  loanDate,  loanAmount) => {

      /**
       * @type Installment[]
       */
      const result = []

      if (!loanDate || !(loanAmount > 0)) {
        return result;
      }

      let prev;

      for (let i = 0; i < loanTermMonths; i++) {
        void function makeInstallment(idx) {
          const $date = xcell([$loanDate], d => getInstallmentDate(d, idx))
          const $paid = prev
            ? xcell([prev.$paid, prev.$principal], plus)
            : xcell(0)
          const $debt = xcell([$loanAmount, $paid], minus)
          const $interestDays = xcell([
            $date,
            prev ? prev.$date : $loanDate
          ], differenceInDays)
          const $interest = xcell([$debt, $rate, $interestDays], getInstallmentInterest)

          let $principal, $amount;
          if (i === loanTermMonths - 1) {
            $principal = xcell([$debt], identity);
            $amount = xcell([$principal, $interest], plus);
          } else {
            const loanTerms = loanTermMonths - idx;
            $amount = xcell([$debt, $rate], (debt, rate) => getMonthlyPayment(debt, loanTerms, rate))
            $principal = xcell([$amount, $interest], minus)
          }

          const installment = new Installment()
          Object.assign(installment, {
            idx,
            $date,
            $interestDays,
            $debt,
            $paid,
            $interest,
            $principal,
            $amount,
          })

          result.push(installment)
          prev = installment;
        }(i)
      }

      return result;
    }
  )

  // cleanup
  $installments.on('change', (_, previous) => {
    for (let installment of previous) {
      installment.dispose();
    }
  })

  // dynamic ranges
  const $interestRange = xcell([$installments], installments =>
    installments.map(i => i.$interest)
  )
  const $interestSum = xcell($interestRange.value, sum)
  $interestRange.on('change', ({ value }) => {
    $interestSum.dependencies = value
  })

  const $amountRange = xcell([$installments], installments =>
    installments.map(i => i.$amount)
  )
  const $amountSum = xcell($amountRange.value, sum)
  $amountRange.on('change', ({ value }) => {
    $amountSum.dependencies = value
  })

  return {
    $rate,
    $loanAmount,
    $loanTermYears,
    $loanTermMonths,
    $loanDate,
    $installments,
    $interestSum,
    $amountSum,
  }
}
