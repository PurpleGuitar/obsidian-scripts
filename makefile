.PHONY: lint
lint:
	docker run --rm -v "$(PWD)":/data cytopia/eslint:latest .
