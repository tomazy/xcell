.PHONY: all build docs docs-examples

all: build docs

build:
	npm run build

docs: docs/index.html docs-examples

docs/index.html: docs/index.md
	.scripts/docs-index.sh > docs/index.html

docs-examples:
	.scripts/docs-examples.sh
