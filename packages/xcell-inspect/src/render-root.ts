import * as yo from 'yo-yo';

// tslint:disable-next-line:no-var-requires
export const css = require('raw-loader!./style.css');

export interface State {
  hidden: boolean;
  loading: boolean;
  zoom: number;
  cellCount: number;
  graph?: HTMLElement;
  error?: string;
  dot?: string;
}

export type SendFunction = (action: string, ...args: any[]) => void;

export function renderRoot(state: State, send: SendFunction): HTMLElement {
  const { hidden, loading, zoom, cellCount } = state;

  const classNames = [
    'xcell-inspect',
    ... hidden ? ['hide'] : [],
  ].join(' ');

  return yo`
    <div class="${classNames}">
      <style>${css}</style>
        <div class="xcell-inspect-menu text-right">
          ${when(hidden, null, /* else */() => [
              when(loading, yo`
                <span>loading graph...</span>
              `),
              yo`
                <i><b>${cellCount}</b> cells</i>
              `,
          ])}
          <button type="button" onclick=${() => send('toggleHidden')}>
            ${hidden ? 'inspect' : 'hide'}
          </button>
        </div>
        ${when(hidden, null, renderContent)}
    </div>
  `;

  function renderContent() {
    const { error, graph, dot } = state;
    return yo`
      <div class="xcell-inspect-content">
        ${when(error, () => yo`
            <div class="xcell-inspect-error">${error}</div>
          `,
          /* else */() => ([
            when(graph, () => yo`
              <div class="text-right">
                ${zoomInput()}
              </div>
            `),
            when(graph, () => yo`
              <div class="xcell-inspect-wrapper">
                ${graph}
              </div>
            `),
            when(dot, renderDOT),
          ]),
        )}
      </div>
    `;

    function renderDOT() {
      const MAX = 5000;
      const remaining = (dot as string).length - MAX;

      return yo`
        <div class="xcell-inspect-dot">
          <div><b>DOT:</b></div>
          <pre>${(dot as string).slice(0, MAX)}${remaining > 0 ? '...' : ''}</pre>
          ${when(remaining > 0, () => yo`
            <div>
              <div>
                <i>and ${remaining} characters more.</i>
              </div>
              <button type="button" onclick=${logToConsole}>send the whole DOT to console</button>
            </div>
          `)}
          <div style="text-align:right">
            <a href="https://www.graphviz.org/">what is dot?</a>
          </div>
        </div>
      `;

      function logToConsole() {
        // tslint:disable-next-line:no-console
        console.log(dot);
      }
    }
  }

  function zoomInput() {
    return yo`
      <input
        type="range"
        oninput=${event => send('zoom', +event.target.value)}
        min="0.1"
        max="1.0"
        step="0.1"
        value=${zoom.toFixed(1)}
      >`;
  }

  function when(condition, trueCase, falseCase?) {
    return(
      (condition)
        ? (typeof trueCase === 'function')
          ? trueCase()
          : trueCase
        : (typeof falseCase === 'function')
          ? falseCase()
          : falseCase
    );
  }
}
