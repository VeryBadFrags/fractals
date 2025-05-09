.PHONY: dev
dev: node_modules
	pnpm dev

.PHONY: build
build: node_modules
	pnpm build

.PHONY: lint
lint: node_modules
	pnpm run lint

.PHONY: format
format:
	pnpm run format

.PHONY: clean
clean:
	pnpm run clean

node_modules: package.json
	pnpm install
