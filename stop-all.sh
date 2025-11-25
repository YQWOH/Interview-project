#!/bin/bash

# Panorama Application - Stop All Services Script

set -e

echo "=========================================="
echo "Stopping Panorama Application"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Stop all services
print_status "Stopping all services..."
docker-compose down

echo ""
print_success "All services stopped successfully!"
echo ""
echo "To start again, run: ./deploy-all.sh"
echo ""
echo "To remove all data (including database), run:"
echo "  docker-compose down -v"
echo ""
