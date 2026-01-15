"""Tests for the places API endpoints."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.api.main import app
from backend.models.place import Place, Coordinates

client = TestClient(app)


class TestPlacesDiscovery:
    """Tests for places discovery endpoints."""

    @patch("backend.api.places.get_places_service")
    def test_discover_places_returns_places(self, mock_get_service):
        """Test that discover endpoint returns places for a city."""
        mock_place = Place(
            id="place_123",
            name="Golden Gate Park",
            address="San Francisco, CA",
            rating=4.7,
            types=["park", "tourist_attraction"],
            coordinates=Coordinates(lat=37.7694, lng=-122.4862),
            photo_reference="photo_ref_123"
        )
        
        mock_service = MagicMock()
        mock_service.discover_places.return_value = [mock_place]
        mock_service.get_photo_url.return_value = "https://example.com/photo.jpg"
        mock_get_service.return_value = mock_service
        
        response = client.get("/api/places/discover/San Francisco")
        
        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "San Francisco, CA"
        assert len(data["places"]) == 1
        assert data["places"][0]["name"] == "Golden Gate Park"

    @patch("backend.api.places.get_places_service")
    def test_discover_with_categories(self, mock_get_service):
        """Test discover endpoint filters by categories."""
        mock_service = MagicMock()
        mock_service.discover_places.return_value = []
        mock_get_service.return_value = mock_service
        
        response = client.get("/api/places/discover/Los Angeles?categories=outdoor,cafes")
        
        assert response.status_code == 200
        mock_service.discover_places.assert_called_once()
        call_kwargs = mock_service.discover_places.call_args
        assert "categories" in call_kwargs.kwargs or len(call_kwargs[1]) > 0

    def test_discover_invalid_category(self):
        """Test that invalid categories return 400 error."""
        response = client.get("/api/places/discover/Oakland?categories=invalid_category")
        
        assert response.status_code == 400
        assert "Invalid categories" in response.json()["detail"]

    def test_get_categories(self):
        """Test that categories endpoint returns available categories."""
        response = client.get("/api/places/categories")
        
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert "descriptions" in data
        assert "attractions" in data["categories"]


class TestPlacesSearch:
    """Tests for places search endpoint."""

    @patch("backend.api.places.get_places_service")
    @patch("backend.api.places.ai_service")
    def test_search_places(self, mock_ai, mock_get_service):
        """Test that search returns matching places."""
        mock_place = Place(
            id="place_456",
            name="Great Coffee Shop",
            address="123 Main St, SF",
            rating=4.3,
            types=["cafe"],
            coordinates=Coordinates(lat=37.77, lng=-122.42)
        )
        
        mock_service = MagicMock()
        mock_service.search_places.return_value = [mock_place]
        mock_service.get_photo_url.return_value = None
        mock_get_service.return_value = mock_service
        
        mock_ai.parse_smart_search.return_value = None
        
        response = client.get("/api/places/search?q=coffee&city=San Francisco")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Great Coffee Shop"

    def test_search_requires_query(self):
        """Test that search requires a query parameter."""
        response = client.get("/api/places/search")
        
        assert response.status_code == 422  # Validation error


class TestCityAutocomplete:
    """Tests for city autocomplete endpoint."""

    @patch("backend.api.places.get_places_service")
    def test_autocomplete_returns_cities(self, mock_get_service):
        """Test that autocomplete returns California cities."""
        mock_service = MagicMock()
        mock_service.autocomplete_cities.return_value = [
            {"name": "San Francisco", "place_id": "abc", "description": "CA", "full_description": "San Francisco, CA"}
        ]
        mock_get_service.return_value = mock_service
        
        response = client.get("/api/places/autocomplete?q=San")
        
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "San"
        assert len(data["cities"]) == 1
