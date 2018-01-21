import * as React from 'react';
import js from 'react-syntax-highlighter/languages/prism/javascript';
import ts from 'react-syntax-highlighter/languages/prism/typescript';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/prism-light';
import style from 'react-syntax-highlighter/styles/prism/duotone-light';

registerLanguage('typescript', ts);
registerLanguage('javascript', js);

const CodeFragment = ({ lang, children, ...rest }) =>
  <SyntaxHighlighter language={lang} style={style} showLineNumbers={true} {...rest}>
    {(children || '').trim()}
  </SyntaxHighlighter>;

export const TypeScriptCode = (params) =>
  <CodeFragment lang='typescript' {...params}/>;

export const JavaScriptCode = (params) =>
  <CodeFragment lang='javascript' {...params}/>;
