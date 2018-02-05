.PHONY: all build docs docs-examples

all: build docs

build:
	npm run build

docs: docs/index.html docs-examples

docs/index.html: docs-src/index.md
	.scripts/docs-index.sh | .scripts/docs-inject-ga.sh > docs/index.html

docs-examples:
	.scripts/docs-examples.sh
