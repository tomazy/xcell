#!/bin/bash

mkdir -p docs/examples

for i in `ls examples`
do
  pushd examples/$i
  npm run build&
  popd
done

wait

for i in `ls examples`
do
  mkdir -p docs/examples/$i
  cp -r examples/$i/dist/* docs/examples/$i
  mv docs/examples/$i/index.html docs/examples/$i/~index.html
  .scripts/docs-inject-ga.sh < docs/examples/$i/~index.html > docs/examples/$i/index.html
  rm docs/examples/$i/~index.html
done

