import { spreadsheet } from './spreadsheet'
import { Sheet } from './sheet'
import { inspect } from 'xcell-inspect'
import yo from 'yo-yo'
import { functions } from './functions'

const sheet = new Sheet()
sheet.setCell('A1', '1')
sheet.setCell('A2', '2')
sheet.setCell('A3', '-1')
sheet.setCell('A4', '4')
sheet.setCell('A5', '5.2')

const samples = [
  'SUM(A1:A7)',
  'AVERAGE(A1:A7)',
  'ROUND(C2;2)',
  'IF(C3 > C2; "More!"; "Less!")',
  'MIN(A1:A7)',
  'MAX(A1:A7)',
  'COUNT(A1:A7)',
  'A1 + A2 - A3 / A4',
]

for (let i = 0; i < samples.length; i++) {
  sheet.setCell(`B${i+1}`, `${samples[i]} —>`)
  sheet.setCell(`C${i+1}`, `=${samples[i]}`)
}

const root = spreadsheet(6, samples.length + 2, sheet)

const app = yo`
  <div>
    <h1>spreadsheet demo</h1>
    ${root}
    <div style="font-size: smaller">
      <p>Navigation: <i>Tab/[Shift] Tab</i>, <i>Enter/[Shift] Enter</i></p>
      <p>
      Supported functions:
      <ul>
        ${Object.keys(functions).sort().map(n => yo`
          <li>${n}</li>
        `)}
      </ul>
      </p>
    </div>
  </div>
`
document.body.appendChild(app)

const inspector = inspect(sheet.getCells(), {
  renderDOT: false,
  renderGraph: true,
  hidden: true
})
document.body.appendChild(inspector.element)

sheet.on('update', () => {
  inspector.update(sheet.getCells())
})

window.sheet = sheet
