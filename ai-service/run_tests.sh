#!/bin/bash
# AI Service Test Runner Script

set -e

echo "🧪 AI Service Test Suite"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${YELLOW}⚠️  pytest not found. Installing test dependencies...${NC}"
    pip install -r requirements-test.txt
fi

# Parse command line arguments
TEST_TYPE=${1:-all}

case $TEST_TYPE in
    "all")
        echo -e "${BLUE}Running all tests...${NC}"
        pytest -v
        ;;
    "unit")
        echo -e "${BLUE}Running unit tests...${NC}"
        pytest tests/test_detector.py tests/test_config.py -v
        ;;
    "api")
        echo -e "${BLUE}Running API tests...${NC}"
        pytest tests/test_main.py tests/test_detection.py -v
        ;;
    "coverage")
        echo -e "${BLUE}Running tests with coverage...${NC}"
        pytest --cov=app --cov-report=html --cov-report=term
        echo ""
        echo -e "${GREEN}✅ Coverage report generated in htmlcov/index.html${NC}"
        ;;
    "fast")
        echo -e "${BLUE}Running fast tests only...${NC}"
        pytest -v -m "not slow"
        ;;
    "watch")
        echo -e "${BLUE}Running tests in watch mode...${NC}"
        pytest-watch
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 [all|unit|api|coverage|fast|watch]${NC}"
        echo ""
        echo "Options:"
        echo "  all      - Run all tests (default)"
        echo "  unit     - Run unit tests only"
        echo "  api      - Run API tests only"
        echo "  coverage - Run with coverage report"
        echo "  fast     - Skip slow tests"
        echo "  watch    - Run in watch mode"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Tests completed!${NC}"
