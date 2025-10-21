.PHONY: help install dev build up down logs clean reset migrate seed

# Default target
help:
	@echo "ShopifyGenie OMS - Available Commands:"
	@echo ""
	@echo "  make install    - Install all dependencies (server + client)"
	@echo "  make dev        - Start development servers"
	@echo "  make build      - Build production images"
	@echo "  make up         - Start all Docker containers"
	@echo "  make down       - Stop all Docker containers"
	@echo "  make logs       - View Docker logs"
	@echo "  make clean      - Clean Docker containers and volumes"
	@echo "  make reset      - Reset database and restart"
	@echo "  make migrate    - Run database migrations"
	@echo "  make seed       - Seed database with sample data"
	@echo ""

# Install dependencies
install:
	@echo "Installing server dependencies..."
	cd server && npm install
	@echo "Installing client dependencies..."
	cd client && npm install
	@echo "✅ Dependencies installed!"

# Development mode
dev:
	@echo "Starting development servers..."
	@echo "Starting backend on port 4000..."
	cd server && npm run dev &
	@echo "Starting frontend on port 3000..."
	cd client && npm run dev

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start Docker containers
up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:4000"
	@echo "GraphQL: http://localhost:4000/graphql"

# Stop Docker containers
down:
	@echo "Stopping Docker containers..."
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Clean everything
clean:
	@echo "Cleaning Docker containers and volumes..."
	docker-compose down -v
	@echo "Cleaning node_modules..."
	rm -rf server/node_modules client/node_modules
	@echo "Cleaning build artifacts..."
	rm -rf server/dist client/dist
	@echo "✅ Cleaned!"

# Reset database
reset:
	@echo "Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres redis
	sleep 5
	cd server && npx prisma migrate deploy
	docker-compose up -d
	@echo "✅ Database reset complete!"

# Run migrations
migrate:
	@echo "Running database migrations..."
	cd server && npx prisma migrate deploy
	@echo "✅ Migrations complete!"

# Seed database (you'll need to create a seed script)
seed:
	@echo "Seeding database..."
	cd server && npx prisma db seed
	@echo "✅ Database seeded!"

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:4000/health || echo "❌ Backend unhealthy"
	@curl -f http://localhost:3000 || echo "❌ Frontend unhealthy"
	@echo "✅ Health check complete!"

