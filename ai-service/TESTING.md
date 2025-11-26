# AI Service Testing Guide

## 📋 Overview

Comprehensive test suite for the YOLOv5 AI Detection Service using pytest.

## 🧪 Test Structure

```
ai-service/tests/
├── __init__.py              # Test package initialization
├── conftest.py              # Shared fixtures and configuration
├── test_main.py             # Main app and endpoint tests
├── test_detection.py        # Detection API endpoint tests
├── test_detector.py         # Detector model unit tests
└── test_config.py           # Configuration tests
```

## 🚀 Quick Start

### 1. Install Test Dependencies

```bash
cd ai-service
pip install -r requirements-test.txt
```

### 2. Run All Tests

```bash
pytest
```

### 3. Run with Coverage

```bash
pytest --cov=app --cov-report=html --cov-report=term
```

### 4. Run Specific Test Files

```bash
# Test main endpoints
pytest tests/test_main.py

# Test detection API
pytest tests/test_detection.py

# Test detector model
pytest tests/test_detector.py

# Test configuration
pytest tests/test_config.py
```

### 5. Run Specific Test Classes

```bash
pytest tests/test_detection.py::TestDetectionAnalyze
pytest tests/test_detector.py::TestObjectDetector
```

### 6. Run Specific Test Methods

```bash
pytest tests/test_main.py::TestMainEndpoints::test_health_endpoint
pytest tests/test_detection.py::TestDetectionAnalyze::test_analyze_success
```

## 📊 Test Categories

### Unit Tests

Test individual components in isolation:

- `test_detector.py` - Detector model logic
- `test_config.py` - Configuration settings

```bash
pytest -m unit
```

### Integration Tests

Test API endpoints and service integration:

- `test_main.py` - Main application endpoints
- `test_detection.py` - Detection API endpoints

```bash
pytest -m integration
```

### API Tests

Test all API endpoints:

```bash
pytest -m api
```

## 🧩 Test Fixtures

### Provided Fixtures (in `conftest.py`)

#### `test_client`

FastAPI test client for making HTTP requests

```python
def test_example(test_client):
    response = test_client.get("/health")
    assert response.status_code == 200
```

#### `sample_image`

Simple test image (640x480 JPEG)

```python
def test_with_image(sample_image):
    files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
    # Use in requests
```

#### `sample_image_file`

Temporary image file on disk

```python
def test_with_file(sample_image_file):
    with open(sample_image_file, 'rb') as f:
        # Use file
```

#### `large_image`

Large test image (1920x1080)

```python
def test_large_image(large_image):
    # Test with large image
```

#### `invalid_image`

Invalid image data for error testing

```python
def test_invalid(invalid_image):
    # Test error handling
```

#### `test_image_with_objects`

Complex image with shapes (for detection testing)

```python
def test_detection(test_image_with_objects):
    # Test object detection
```

## 📝 Test Coverage

### Main Application (`test_main.py`)

- ✅ Root endpoint
- ✅ Health check endpoint
- ✅ Swagger docs endpoint
- ✅ ReDoc endpoint
- ✅ OpenAPI schema
- ✅ CORS configuration
- ✅ Error handling (404, 405)

### Detection API (`test_detection.py`)

- ✅ Analyze endpoint success
- ✅ Custom confidence threshold
- ✅ Custom max detections
- ✅ No file upload error
- ✅ Invalid image handling
- ✅ Large image handling
- ✅ Response structure validation
- ✅ Detect endpoint
- ✅ Health check
- ✅ Input validation

### Detector Model (`test_detector.py`)

- ✅ Detector initialization
- ✅ Object detection
- ✅ Custom confidence threshold
- ✅ Max detections limit
- ✅ Full image analysis
- ✅ Description generation
- ✅ Summary generation
- ✅ Singleton pattern
- ✅ Edge cases (empty, large, grayscale images)

### Configuration (`test_config.py`)

- ✅ Settings initialization
- ✅ Default values
- ✅ CORS origins parsing
- ✅ File upload config
- ✅ Allowed extensions
- ✅ Value validation
- ✅ Environment variables

## 🎯 Test Examples

### Testing API Endpoints

```python
def test_analyze_endpoint(test_client, sample_image):
    """Test image analysis endpoint"""
    files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}

    response = test_client.post("/api/detection/analyze", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "detections" in data["data"]
```

### Testing Detector Model

```python
def test_detector(detector, test_image):
    """Test object detection"""
    detections = detector.detect_objects(test_image)

    assert isinstance(detections, list)
    for detection in detections:
        assert "class_name" in detection
        assert "confidence" in detection
        assert "bbox" in detection
```

### Testing with Custom Parameters

```python
def test_custom_params(test_client, sample_image):
    """Test with custom detection parameters"""
    files = {"file": ("test.jpg", io.BytesIO(sample_image), "image/jpeg")}
    data = {
        "confidence_threshold": 0.7,
        "max_detections": 5
    }

    response = test_client.post(
        "/api/detection/analyze",
        files=files,
        data=data
    )

    assert response.status_code == 200
    result = response.json()
    assert len(result["data"]["detections"]) <= 5
```

## 🔧 Advanced Usage

### Run Tests in Parallel

```bash
pip install pytest-xdist
pytest -n auto
```

### Run Only Failed Tests

```bash
pytest --lf  # last failed
pytest --ff  # failed first
```

### Stop on First Failure

```bash
pytest -x
```

### Verbose Output

```bash
pytest -vv
```

### Show Print Statements

```bash
pytest -s
```

### Generate HTML Report

```bash
pytest --html=report.html --self-contained-html
```

## 📈 Coverage Reports

### Generate Coverage Report

```bash
pytest --cov=app --cov-report=html
```

View report:

```bash
open htmlcov/index.html
```

### Coverage with Missing Lines

```bash
pytest --cov=app --cov-report=term-missing
```

### Minimum Coverage Threshold

```bash
pytest --cov=app --cov-fail-under=80
```

## 🐛 Debugging Tests

### Run with PDB on Failure

```bash
pytest --pdb
```

### Run with Trace

```bash
pytest --trace
```

### Show Local Variables on Failure

```bash
pytest -l
```

## 🔍 Test Markers

### Mark Tests

```python
@pytest.mark.slow
def test_slow_operation():
    # Slow test
    pass

@pytest.mark.integration
def test_api_integration():
    # Integration test
    pass
```

### Run Marked Tests

```bash
# Run only slow tests
pytest -m slow

# Skip slow tests
pytest -m "not slow"

# Run integration tests
pytest -m integration
```

## 📦 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.11

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-test.txt

      - name: Run tests
        run: pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### Docker Testing

```bash
# Build test image
docker build -t ai-service-test -f Dockerfile.test .

# Run tests in container
docker run --rm ai-service-test pytest
```

## 🎓 Best Practices

### 1. Test Naming

- Use descriptive names: `test_analyze_with_custom_confidence`
- Follow pattern: `test_<what>_<condition>_<expected>`

### 2. Test Organization

- Group related tests in classes
- Use fixtures for common setup
- Keep tests independent

### 3. Assertions

- Use specific assertions
- Test one thing per test
- Include helpful error messages

### 4. Coverage

- Aim for >80% coverage
- Focus on critical paths
- Don't test external libraries

### 5. Performance

- Keep tests fast
- Use mocks for slow operations
- Mark slow tests appropriately

## 🚨 Common Issues

### Issue: Model Download During Tests

**Solution**: Mock the model loading or use a cached model

### Issue: Tests Too Slow

**Solution**: Use smaller images, mock heavy operations, run in parallel

### Issue: Flaky Tests

**Solution**: Avoid time-dependent tests, use proper fixtures, ensure test isolation

## 📚 Resources

- **Pytest Docs**: https://docs.pytest.org/
- **FastAPI Testing**: https://fastapi.tiangolo.com/tutorial/testing/
- **Coverage.py**: https://coverage.readthedocs.io/

## 🎉 Running Tests Successfully

Expected output:

```
============================= test session starts ==============================
collected 50 items

tests/test_main.py ........                                              [ 16%]
tests/test_detection.py ....................                             [ 56%]
tests/test_detector.py ..................                                [ 92%]
tests/test_config.py ....                                                [100%]

============================== 50 passed in 15.23s ==============================
```

## 💡 Tips for Interview

When discussing testing:

1. **Coverage**: "I wrote comprehensive tests covering API endpoints, model logic, and configuration"
2. **Test Types**: "Included unit tests, integration tests, and API tests"
3. **Fixtures**: "Used pytest fixtures for reusable test components"
4. **Best Practices**: "Followed TDD principles and maintained >80% coverage"
5. **CI/CD**: "Tests run automatically in CI/CD pipeline"

---

**Happy Testing!** 🧪✨
