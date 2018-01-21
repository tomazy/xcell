import * as React from 'react';
import { JavaScriptCode, TypeScriptCode } from './Code';

// tslint:disable-next-line:no-var-requires
const spreadsheet1 = require('./spreadsheet-1.png');

export const Article = () =>
  <article>
    In the article about <b>Reactive Programming</b>{' '}
    Wikipedia <a href='https://en.wikipedia.org/wiki/Reactive_programming'>says</a>:
    <blockquote>
      (...) in an <i>imperative programming</i> setting, <code>a := b + c</code> would
      mean that <code>a</code> is being assigned the result of <code>b + c</code> in
      the instant the expression is evaluated, and later, the values of <code>b</code> and/or <code>c</code> can
      be changed with no effect on the value of <code>a</code>.

      However, in <i>reactive programming</i>, the value of <code>a</code> is automatically
      updated whenever the values of <code>b</code> and/or <code>c</code> change;
      without the program having to re-execute the sentence <code>a := b + c</code> to
      determine the presently assigned value of <code>a</code>.
    </blockquote>

    <p>
      This is similar to what we experience with spreadsheets. Given a formula:
    </p>

    <figure>
      <img src={spreadsheet1} />
    </figure>

    <p>
      we expect <code>A1</code> cell to update automatically whenever <code>B1</code> or <code>C1</code> change.
    </p>

    <p>
      Sometimes it would be desirable to use such kind of programming in our applications.
    </p>

    <p>
      There are already JavaScript libraries that implement some sort of functional reactive programming
      e.g. <a href='http://reactivex.io/rxjs/'>RxJS</a> or <a href='https://mobx.js.org'>MobX</a>.
    </p>

    <p>
      Let's see how such a thing could be implemented in JavaScript.
    </p>

    <p>
      First, let's write some imaginary code to get a feeling how such a library could be used:
    </p>

    <JavaScriptCode>{`
const $b = createCell(1)
const $c = createCell(2)
const $a = createCell([$b, $c], (b, c) => b + c)

console.log($a.value)
// 3

$b.value = 100
console.log($a.value)
// 102

$c.value = 200
console.log($a.value)
// 300
`}
    </JavaScriptCode>
    <p>
      <code>createCell()</code> function will take either a value or a list of dependencies
      and a function that updates the value of the cell.
    </p>
  </article>;
