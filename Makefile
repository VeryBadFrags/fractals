.PHONY: dev
dev:
	pnpm dev

.PHONY: build
build:
	pnpm build

.PHONY: lint
lint:
	pnpm run lint

.PHONY: format
format:
	pnpm run format
