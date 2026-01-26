.PHONY: help install dev build test lint clean docker-build docker-up docker-down prod-build prod-deploy

# Default target
help:
	@echo "Available commands:"
	@echo "  install      - Install dependencies"
	@echo "  dev          - Start development servers"
	@echo "  build        - Build for production"
	@echo "  test         - Run tests"
	@echo "  lint         - Run linting"
	@echo "  clean        - Clean build artifacts"
	@echo "  docker-build - Build Docker images"
	@echo "  docker-up    - Start Docker containers"
	@echo "  docker-down  - Stop Docker containers"
	@echo "  prod-build   - Build production Docker images"
	@echo "  prod-deploy  - Deploy to production"

# Development
install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

clean:
	rm -rf apps/api/dist
	rm -rf apps/web/.next
	rm -rf node_modules
	rm -rf apps/*/node_modules

# Docker Development
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

# Production
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Database
db-migrate:
	npm run migrate --workspace=apps/api

db-seed:
	npm run seed --workspace=apps/api

db-reset:
	docker-compose exec postgres psql -U instasell -d instasell -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	$(MAKE) db-migrate
	$(MAKE) db-seed

# Backup
backup-db:
	docker-compose exec postgres pg_dump -U instasell instasell > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db:
	@read -p "Enter backup file path: " backup_file; \
	docker-compose exec -T postgres psql -U instasell instasell < $$backup_file

# SSL Certificates (for production)
generate-ssl:
	mkdir -p infra/nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout infra/nginx/ssl/key.pem \
		-out infra/nginx/ssl/cert.pem \
		-subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"

# Health checks
health-check:
	@echo "Checking API health..."
	@curl -f http://localhost:3001/health || echo "API is down"
	@echo "Checking Web health..."
	@curl -f http://localhost:3000 || echo "Web is down"

# Monitoring
monitor-logs:
	tail -f logs/app.log

monitor-metrics:
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana: http://localhost:3001 (admin/admin)"

# Security
security-scan:
	npm audit
	docker run --rm -v $(PWD):/app -w /app securecodewarrior/docker-security-scanner

# Performance
load-test:
	@echo "Running load tests..."
	@echo "Install artillery: npm install -g artillery"
	@echo "Run: artillery quick --count 10 --num 100 http://localhost:3000"