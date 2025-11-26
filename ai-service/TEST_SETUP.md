# AI Service Test Setup Guide

## ✅ Tests Successfully Running

**Status**: All 50 tests passing with 91% code coverage

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd /Users/steven/project/Interview-project/ai-service
python3 -m venv venv
```

### 2. Activate Virtual Environment

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
# Upgrade pip and tools
pip install --upgrade pip setuptools wheel

# Install PyTorch (CPU version for Mac ARM64)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install core dependencies
pip install fastapi uvicorn python-multipart opencv-python-headless pydantic pydantic-settings

# Install YOLOv5 and other requirements
pip install tqdm yolov5 aiofiles python-jose passlib pandas seaborn

# Install test dependencies
pip install -r requirements-test.txt
```

## Running Tests

### Basic Test Commands

```bash
# Activate virtual environment first
source venv/bin/activate

# Run all tests
pytest -v

# Run with coverage
pytest --cov=app --cov-report=term --cov-report=html

# Run specific test file
pytest tests/test_main.py -v
pytest tests/test_detection.py -v
pytest tests/test_detector.py -v
pytest tests/test_config.py -v
```

### Using the Test Script

```bash
# Make sure you're in the virtual environment
source venv/bin/activate

# Run all tests
./run_tests.sh

# Run specific test types
./run_tests.sh unit      # Unit tests only
./run_tests.sh api       # API tests only
./run_tests.sh coverage  # With coverage report
./run_tests.sh fast      # Skip slow tests
```

## Test Results

```
============ 50 passed, 32 warnings in 35.16s ============

Coverage Report:
Name                     Stmts   Miss  Cover
--------------------------------------------
app/__init__.py              2      0   100%
app/api/__init__.py          2      0   100%
app/api/detection.py        45      6    87%
app/core/__init__.py         2      0   100%
app/core/config.py          25      0   100%
app/main.py                 24      0   100%
app/models/__init__.py       2      0   100%
app/models/detector.py      72     10    86%
--------------------------------------------
TOTAL                      174     16    91%
```

## Test Coverage

### Test Files

- ✅ `test_main.py` - Main endpoints (8 tests)
- ✅ `test_detection.py` - Detection API (16 tests)
- ✅ `test_detector.py` - Detector model (20 tests)
- ✅ `test_config.py` - Configuration (6 tests)

### What's Tested

- ✅ Health check endpoints
- ✅ API documentation endpoints
- ✅ CORS configuration
- ✅ Image upload and analysis
- ✅ Object detection with custom parameters
- ✅ Error handling and validation
- ✅ Edge cases (empty images, large images, grayscale)
- ✅ Configuration settings

## Viewing Coverage Report

After running tests with coverage:

```bash
# Open HTML coverage report
open htmlcov/index.html
```

## Troubleshooting

### Issue: `pip: command not found`

**Solution**: Use `pip3` or create a virtual environment

### Issue: `externally-managed-environment`

**Solution**: Always use a virtual environment (see setup instructions above)

### Issue: Missing dependencies

**Solution**: Follow the installation steps in order, especially PyTorch first

## Quick Reference

```bash
# One-time setup
cd /Users/steven/project/Interview-project/ai-service
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install fastapi uvicorn python-multipart opencv-python-headless pydantic pydantic-settings
pip install tqdm yolov5 aiofiles python-jose passlib pandas seaborn
pip install -r requirements-test.txt

# Every time you want to run tests
source venv/bin/activate
pytest -v
```

## Deactivate Virtual Environment

When done testing:

```bash
deactivate
```
