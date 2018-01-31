import assert from 'assert'
import * as formulaAst from 'formula-ast'

export const parse = formulaAst.parse.bind(formulaAst)

const INFIX_SYMBOL = {
  'infix-add': '+',
  'infix-subtract': '-',
  'infix-multiply': '*',
  'infix-divide': '/',
  'infix-gt': '>',
  'infix-gte': '>=',
  'infix-lt': '<',
  'infix-lte': '<=',
  'infix-eq': '=='
}

export class CompilerContext {
  constructor () {
    this.refs = []
    this.ranges = []
  }

  ref (cell) {
    this.refs.push(cell)
  }

  range (tl, br) {
    this.ranges.push({ tl, br })
  }
}

export function compile (formula) {
  const ast = parse(formula)
  const ctx = new CompilerContext()
  const code = compileAst(ctx, ast)
  return {
    type: ast.type === 'value' ? 'value' : 'function',
    code,
    refs: ctx.refs,
    ranges: ctx.ranges
  }
}

function compileAst (ctx, node) {
  let children
  let op
  switch (node.type) {
    case 'operator':
      switch (node.subtype) {
        case 'infix-add':
        case 'infix-subtract':
        case 'infix-multiply':
        case 'infix-divide':
        case 'infix-gt':
        case 'infix-gte':
        case 'infix-lt':
        case 'infix-lte':
        case 'infix-eq':
          children = node.operands.map(n => compileAst(ctx, n))
          op = INFIX_SYMBOL[node.subtype]
          return '(' + children.join(op) + ')'
        case 'prefix-minus':
          return `-(${compileAst(ctx, node.operands[0])})`
        default:
          throw new Error('Unhandled operator: ' + node.subtype)
      }

    case 'cell':
      const addr = node.addr.toUpperCase()
      ctx.ref(addr)
      return addr

    case 'range':
      const tl = node.topLeft
      const br = node.bottomRight
      assert(tl.type === 'cell', 'expected "cell" type')
      assert(br.type === 'cell', 'expected "cell" type')

      const tlAddr = tl.addr.toUpperCase()
      const brAddr = br.addr.toUpperCase()

      const ref = `${tlAddr}_${brAddr}`

      ctx.range(tlAddr, brAddr)
      ctx.ref(ref)
      return ref

    case 'value':
      switch (node.subtype) {
        case 'array':
          return node.items.map(i => compileAst(ctx, i))
        case 'string':
          return JSON.stringify(node.value)
        default:
          return node.value
      }

    case 'function':
      const fnName = node.name.toUpperCase()
      const args = node.args.map(n => compileAst(ctx, n))
      return `arguments.callee.${fnName}(${args.join(',')})`

    default:
      throw new Error('Unhandled type: ' + node.type)
  }
}
