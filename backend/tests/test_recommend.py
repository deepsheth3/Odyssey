"""Tests for the recommendation API endpoints."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.api.main import app
from backend.models.place import Place, Coordinates

client = TestClient(app)


class TestRecommendEndpoint:
    """Tests for the /api/recommend/ endpoint."""

    @patch("backend.api.recommend.get_places_service")
    @patch("backend.api.recommend.get_recommendation_service")
    def test_recommend_returns_recommendations(self, mock_rec_service, mock_places_service):
        """Test that recommendations endpoint returns scored places."""
        # Setup mock places
        mock_place = Place(
            id="test_place_1",
            name="Test Park",
            address="123 Test St",
            rating=4.5,
            types=["park", "outdoor"],
            coordinates=Coordinates(lat=37.7749, lng=-122.4194)
        )
        
        mock_places_svc = MagicMock()
        mock_places_svc.discover_places.return_value = [mock_place]
        mock_places_svc.get_photo_url.return_value = "https://example.com/photo.jpg"
        mock_places_service.return_value = mock_places_svc
        
        mock_rec_svc = MagicMock()
        mock_rec_svc.recommend.return_value = [
            {"place": mock_place, "score": 85.0, "reasons": ["Great for outdoor activities"]}
        ]
        mock_rec_service.return_value = mock_rec_svc
        
        # Make request
        response = client.post("/api/recommend/", json={
            "city": "San Francisco, CA",
            "user_preference": {
                "activities": ["outdoor"],
                "price_range": "moderate",
                "travel_pace": "relaxed",
                "start_time": "09:00",
                "end_time": "18:00",
                "accessibility_needs": False,
                "has_car": True
            }
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "San Francisco, CA"
        assert data["count"] == 1
        assert len(data["recommendations"]) == 1
        assert data["recommendations"][0]["name"] == "Test Park"
        assert data["recommendations"][0]["score"] == 85.0

    def test_get_activity_types(self):
        """Test that activity types endpoint returns list of activities."""
        response = client.get("/api/recommend/activity-types")
        
        assert response.status_code == 200
        data = response.json()
        assert "activities" in data
        assert isinstance(data["activities"], list)
        assert len(data["activities"]) > 0

    def test_get_price_ranges(self):
        """Test that price ranges endpoint returns list of ranges."""
        response = client.get("/api/recommend/price-ranges")
        
        assert response.status_code == 200
        data = response.json()
        assert "ranges" in data
        assert isinstance(data["ranges"], list)
        assert len(data["ranges"]) == 5
