import getDate from 'date-fns/get_date'
import getMonth from 'date-fns/get_month'
import getYear from 'date-fns/get_year'
import lastDayOfMonth from 'date-fns/last_day_of_month'

function capOnLastDayOfTheMonth(year, month, day) {
  const lastDay = getDate(lastDayOfMonth(new Date(year, month, 1)))
  return new Date(year, month, Math.min(lastDay, day))
}

export function getInstallmentDate(payoutDate, installmentIndex) {
  const year = getYear(payoutDate) + Math.floor(installmentIndex / 12)
  const month = getMonth(payoutDate) + installmentIndex % 12 + 1
  const day = getDate(payoutDate)

  return capOnLastDayOfTheMonth(year, month, day)
}

export function getInstallmentInterest(loan, interestRate, interestDays) {
  return loan * (interestRate / 100) * interestDays / 365
}

export function getMonthlyPayment(S, n, rate) {
  // I = S * q^n * (q-1)/(q^n-1)
  // I: monthly payment
  // S: loan amount
  // n: loan terms
  // r: rate
  // q: 1 + (r / 12)
  const r = rate / 100
  const q = 1 + (r / 12)
  const q_pow_n = Math.pow(q, n)
  return S * q_pow_n * (q - 1) / (q_pow_n - 1)
}

export function minus(a, b) {
  return a - b
}

export function plus(a, b) {
  return a + b
}

export function sum(...args) {
  return args.reduce((acc, e) => acc + e, 0)
}

export function identity(x) {
  return x;
}
