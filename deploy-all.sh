#!/bin/bash

# Panorama Application - Unified Deployment Script
# Deploys all services using single docker-compose.yml

set -e  # Exit on error

echo "=========================================="
echo "Panorama Application Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is running
print_status "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi
print_success "Docker is running"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_success "Created .env file. Please review and update if needed."
    echo ""
fi

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down 2>/dev/null || true
echo ""

# Build and start all services
print_status "Building and starting all services..."
print_status "This may take a few minutes on first run (downloading images, building containers)..."
echo ""

docker-compose up -d --build

echo ""
print_success "All services started!"
echo ""

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
echo ""

# Wait for backend
print_status "Checking backend..."
for i in {1..30}; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend health check timeout, but continuing..."
    fi
    sleep 2
done

# Wait for AI service
print_status "Checking AI service (may take longer on first run - downloading model)..."
for i in {1..60}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "AI service is healthy"
        break
    fi
    if [ $i -eq 60 ]; then
        print_warning "AI service health check timeout, but continuing..."
    fi
    sleep 2
done

# Wait for frontend
print_status "Checking frontend..."
for i in {1..20}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
        break
    fi
    if [ $i -eq 20 ]; then
        print_warning "Frontend health check timeout, but continuing..."
    fi
    sleep 2
done

echo ""

# Show running containers
print_status "Running containers:"
echo ""
docker-compose ps
echo ""

# Print access information
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Access your application:"
echo ""
echo "  Frontend:        http://localhost:3000"
echo "  Backend API:     http://localhost:5000"
echo "  Swagger Docs:    http://localhost:5000/api-docs"
echo "  GraphQL:         http://localhost:5000/graphql"
echo "  AI Service:      http://localhost:8000"
echo "  AI Service Docs: http://localhost:8000/docs"
echo "  Mongo Express:   http://localhost:8081 (admin/admin123)"
echo ""
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Create a user account at http://localhost:3000"
echo "  2. Login and upload images in the Images tab"
echo "  3. Try the AI Detection feature!"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f [service-name]"
echo "  Stop all:         docker-compose down"
echo "  Restart service:  docker-compose restart [service-name]"
echo "  View status:      docker-compose ps"
echo ""
