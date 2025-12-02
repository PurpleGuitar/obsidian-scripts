.PHONY: lint
lint:
	docker run --rm -v "$(PWD)":/data cytopia/eslint .

.PHONY: lint-fix
lint-fix:
	docker run --rm -v "$(PWD)":/data cytopia/eslint --fix .
