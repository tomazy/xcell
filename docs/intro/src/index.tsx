import * as React from 'react';
import { render } from 'react-dom';
import { Article } from './Article';

const App = () =>
  <main>
    <h1>Reactive calculations</h1>
    <Article></Article>
  </main>;

render(<App />, document.getElementById('app'));
