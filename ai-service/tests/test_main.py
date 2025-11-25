"""
Tests for main FastAPI application endpoints
"""
import pytest
from fastapi.testclient import TestClient


class TestMainEndpoints:
    """Test main application endpoints"""
    
    def test_root_endpoint(self, test_client: TestClient):
        """Test root endpoint returns service information"""
        response = test_client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "service" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"
        assert "docs" in data
        assert "health" in data
    
    def test_health_endpoint(self, test_client: TestClient):
        """Test health check endpoint"""
        response = test_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data
    
    def test_docs_endpoint(self, test_client: TestClient):
        """Test Swagger docs endpoint is accessible"""
        response = test_client.get("/docs")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
    
    def test_redoc_endpoint(self, test_client: TestClient):
        """Test ReDoc endpoint is accessible"""
        response = test_client.get("/redoc")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
    
    def test_openapi_schema(self, test_client: TestClient):
        """Test OpenAPI schema is available"""
        response = test_client.get("/openapi.json")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data


class TestCORS:
    """Test CORS configuration"""
    
    def test_cors_headers(self, test_client: TestClient):
        """Test CORS headers are present"""
        response = test_client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        )
        
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers


class TestErrorHandling:
    """Test error handling"""
    
    def test_404_not_found(self, test_client: TestClient):
        """Test 404 for non-existent endpoint"""
        response = test_client.get("/nonexistent")
        
        assert response.status_code == 404
    
    def test_method_not_allowed(self, test_client: TestClient):
        """Test 405 for wrong HTTP method"""
        response = test_client.post("/health")
        
        assert response.status_code == 405
