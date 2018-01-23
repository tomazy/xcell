import differenceInDays from 'date-fns/difference_in_days'
import { createCell as $, Cell } from 'xcell'

import {
  getInstallmentDate,
  getInstallmentInterest,
  getMonthlyPayment,
  minus,
  plus,
  sum,
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

export function createSheet({ loanAmount, rate, loanDate, loanTermYears = 30 }) {
  const $rate = $(rate)
  const $loanAmount = $(loanAmount)
  const $loanTermYears = $(loanTermYears)
  const $loanTermMonths = $([$loanTermYears], x => x * 12)
  const $loanDate = $(loanDate)

  const $installments = $(
    [$loanTermMonths, $loanDate, $loanAmount],
    ( loanTermMonths,  loanDate,  loanAmount) => {
      const result = []

      if (!loanDate || !(loanAmount > 0)) {
        return result;
      }

      let prev;

      for (let i = 0; i < loanTermMonths; i++) {
        void function makeInstallment(idx) {
          const remaining = loanTermMonths - idx;

          const $date = $([$loanDate], d => getInstallmentDate(d, idx))
          const $paid = prev
            ? $([prev.$paid, prev.$principal], plus)
            : $(0)
          const $debt = $([$loanAmount, $paid], minus)
          const $amount = $([$debt, $rate], (debt, rate) => getMonthlyPayment(debt, remaining, rate))
          const $interestDays = $([
            $date,
            prev ? prev.$date : $loanDate
          ], differenceInDays)
          const $interest = $([$debt, $rate, $interestDays], getInstallmentInterest)
          const $principal = $([$amount, $interest], minus)

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
  const $interestRange = $([$installments], installments =>
    installments.map(i => i.$interest)
  )
  const $interestSum = $($interestRange.value, sum)
  $interestRange.on('change', ({ value }) => {
    $interestSum.dependencies = value
  })

  const $amountRange = $([$installments], installments =>
    installments.map(i => i.$amount)
  )
  const $amountSum = $($amountRange.value, sum)
  $amountRange.on('change', ({ value }) => {
    $amountSum.dependencies = value
  })

  return {
    $rate,
    $loanAmount,
    $loanTermYears,
    $loanDate,
    $installments,
    $interestSum,
    $amountSum,
  }
}
const $rate = $(1.2)
const $loanAmount = $(425000)
const $loanTermYears = $(30)
const $loanTermMonths = $([$loanTermYears], x => x * 12)
const $loanDate = $(new Date(2018, 0, 1))

const $installments = $(
  [$loanTermMonths],
  (n) => {
    const result = []
    let prev;

    for (let i = 0; i < n; i++) {
      void function makeInstallment(idx) {
        const remaining = n - idx;

        const $date = $([$loanDate], d => getInstallmentDate(d, idx))
        const $paid = prev
          ? $([prev.$paid, prev.$principal], plus)
          : $(0)
        const $debt = $([$loanAmount, $paid], minus)
        const $amount = $([$debt, $rate], (debt, rate) => getMonthlyPayment(debt, remaining, rate))
        const $interestDays = $([
          $date,
          prev ? prev.$date : $loanDate
        ], differenceInDays)
        const $interest = $([$debt, $rate, $interestDays], getInstallmentInterest)
        const $principal = $([$amount, $interest], minus)

        const installment = {
          idx,
          $date,
          $interestDays,
          $debt,
          $paid,
          $interest,
          $principal,
          $amount,
        }

        result.push(installment)
        prev = installment;
      }(i)
    }

    return result;
  }
)

const $interestRange = $([$installments], installments =>
  installments.map(i => i.$interest)
)

const $interestSum = $($interestRange.value, sum)
$interestRange.on('change', ({ value }) => {
  $interestSum.dependencies = value
})

const $amountRange = $([$installments], installments =>
  installments.map(i => i.$amount)
)
const $amountSum = $($amountRange.value, sum)
$amountRange.on('change', ({ value }) => {
  $amountSum.dependencies = value
})
