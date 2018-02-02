#!/bin/bash

set -e

REMARK=./node_modules/.bin/remark
REMARK_CMD="${REMARK} \
  -q \
  --use html \
  --use highlight.js \
  --use preset-lint-markdown-style-guide"

cat docs-src/index.html.begin \
  <(${REMARK_CMD} docs-src/index.md) \
  docs-src/index.html.end
