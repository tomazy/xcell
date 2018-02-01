#!/bin/bash

set -e

REMARK=./node_modules/.bin/remark
REMARK_CMD="${REMARK} \
  -q \
  --use html \
  --use highlight.js \
  --use preset-lint-markdown-style-guide"

cat docs/index.html.begin \
  <(${REMARK_CMD} docs/index.md) \
  docs/index.html.end
