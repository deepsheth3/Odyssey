from fastapi.testclient import TestClient
from backend.api.main import app
import pytest

client = TestClient(app)

def test_rate_limit_expensive_endpoint():
    """
    Test that the rate limiter blocks excessive requests to expensive endpoints.
    Limit is 10/minute.
    """
    url = "/api/places/search"
    params = {"q": "park", "city": "San Francisco"}
    
    # Send 10 allowed requests
    for i in range(10):
        response = client.get(url, params=params)
        assert response.status_code == 200, f"Request {i+1} failed with {response.status_code}"

    # The 11th request should be blocked
    response = client.get(url, params=params)
    assert response.status_code == 429, f"Rate limit not enforced! Status: {response.status_code}"
    assert "Too Many Requests" in response.text or "rate limit exceeded" in response.text.lower()
