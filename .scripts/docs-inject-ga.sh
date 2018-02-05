#!/bin/bash

set -e

sed '/<\/head>/ {
  h
  r docs-src/ga.html.snippet
  g
  N
}'
