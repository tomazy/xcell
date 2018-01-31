#!/bin/bash

mkdir -p docs/examples

for i in `ls examples`
do
  pushd examples/$i
  npm run build
  popd

  mkdir -p docs/examples/$i
  cp -r examples/$i/dist/* docs/examples/$i
done

