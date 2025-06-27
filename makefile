.PHONY: lint
lint:
	docker run --rm -v "$(PWD)":/app -w /app node npx eslint .
