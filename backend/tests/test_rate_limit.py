from fastapi.testclient import TestClient
from backend.api.main import app
from unittest.mock import patch, MagicMock
from backend.models.place import Place

client = TestClient(app)

def test_rate_limit_expensive_endpoint():
    """
    Test that the rate limiter blocks excessive requests to expensive endpoints.
    Limit is 10/minute.
    Mocks the external service to avoid hitting Google APIs.
    """
    url = "/api/places/search"
    params = {"q": "park", "city": "San Francisco"}
    
    # Mock the service ensuring it returns a valid empty list or dummy data
    # We patch where it's used: backend.api.places.get_places_service
    with patch("backend.api.places.get_places_service") as mock_get_service:
        # content of the mock
        mock_service = MagicMock()
        mock_service.search_places.return_value = [] # Return empty list, sufficient for 200 OK
        mock_get_service.return_value = mock_service
        
        # Send 9 allowed requests (limit is 10/minute)
        for i in range(9):
            response = client.get(url, params=params)
            assert response.status_code == 200, f"Request {i+1} failed with {response.status_code}: {response.text}"

        # The 10th request should be blocked
        response = client.get(url, params=params)
        assert response.status_code == 429, f"Rate limit not enforced! Status: {response.status_code}"
