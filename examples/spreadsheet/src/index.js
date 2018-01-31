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

sheet.setCell('B1', 'SUM(A1:A7) =')
sheet.setCell('C1', '=SUM(A1:A7)')

sheet.setCell('B2', 'AVERAGE(A1:A7) =')
sheet.setCell('C2', '=AVERAGE(A1:A7)')

sheet.setCell('B3', 'ROUND(C2;2) =')
sheet.setCell('C3', '=ROUND(C2;2)')

sheet.setCell('B4', 'IF(C3 > C2; "Up!"; "Down!") =')
sheet.setCell('C4', '=IF(C3 > C2; "Up!"; "Down!")')

sheet.setCell('B5', 'MIN(A1:A7) =')
sheet.setCell('C5', '=MIN(A1:A7)')

sheet.setCell('B6', 'MAX(A1:A7) =')
sheet.setCell('C6', '=MAX(A1:A7)')

sheet.setCell('B7', 'COUNT(A1:A7) =')
sheet.setCell('C7', '=COUNT(A1:A7)')

sheet.setCell('B8', 'A1 + A2 - A3 / A4 =')
sheet.setCell('C8', '=A1 + A2 - A3 / A4')

const root = spreadsheet(5, 8, sheet)

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
