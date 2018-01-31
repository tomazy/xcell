import { compile } from './formula'
import { functions } from './functions'

/**
 * @param {string} formula
 */
export function compileFormula (formula) {
  const result = compile(formula)
  if (result.type === 'value') {
    return result.code
  } else {
    const fn = new Function(...result.refs, `return ${result.code};`) // eslint-disable-line
    fn.refs = result.refs
    fn.ranges = result.ranges
    Object.assign(fn, functions)
    return fn
  }
}
