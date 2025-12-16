.PHONY: help install build dev test seed migrate docker-up docker-down docker-logs clean

help:
	@echo "BIDBAD Development Commands"
	@echo "=============================="
	@echo "make install       - Install all dependencies"
	@echo "make dev           - Start development servers"
	@echo "make build         - Build for production"
	@echo "make test          - Run all tests"
	@echo "make seed          - Seed database with demo data"
	@echo "make migrate       - Run database migrations"
	@echo "make docker-up     - Start Docker services"
	@echo "make docker-down   - Stop Docker services"
	@echo "make docker-logs   - View Docker logs"
	@echo "make clean         - Clean build artifacts"

install:
	yarn install

dev:
	yarn dev

build:
	yarn build

test:
	yarn test

seed:
	docker-compose exec api yarn seed

migrate:
	docker-compose exec api yarn migrate

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-build:
	docker-compose build

docker-full: docker-build docker-up
	@echo "Waiting for services to be ready..."
	@sleep 5
	@make migrate
	@make seed
	@echo "✅ BIDBAD is ready at http://localhost:3000"

clean:
	rm -rf apps/api/dist apps/web/.next
	docker-compose down -v

reset-db:
	docker-compose exec postgres psql -U instasell -d instasell -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	make migrate
	make seed

lint:
	yarn workspace api lint
	yarn workspace web lint

format:
	yarn workspace api format
	yarn workspace web format
