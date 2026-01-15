"""Tests for the routes API endpoints."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.api.main import app

client = TestClient(app)


class TestRouteOptimization:
    """Tests for route optimization endpoints."""

    @patch("backend.api.routes.get_optimizer")
    def test_optimize_route_basic(self, mock_get_optimizer):
        """Test basic route optimization returns optimized order."""
        mock_optimizer = MagicMock()
        mock_optimizer.optimize_route.return_value = {
            "original_order": ["A", "B", "C"],
            "optimized_order": ["A", "C", "B"],
            "original_duration_seconds": 3600,
            "optimized_duration_seconds": 2400,
            "time_saved_seconds": 1200,
            "original_distance_meters": 10000,
            "optimized_distance_meters": 8000,
            "distance_saved_meters": 2000
        }
        mock_get_optimizer.return_value = mock_optimizer
        
        response = client.post("/api/routes/optimize", json={
            "start": "San Francisco, CA",
            "stops": ["Golden Gate Park", "Fisherman's Wharf", "Alcatraz Ferry"]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "optimized_order" in data
        assert data["time_saved_seconds"] == 1200


class TestRouteDetails:
    """Tests for route details endpoint."""

    @patch("backend.api.routes.get_optimizer")
    def test_get_route_details(self, mock_get_optimizer):
        """Test that route details returns segment information."""
        mock_optimizer = MagicMock()
        mock_optimizer.get_route_details.return_value = [
            {
                "from": "Point A",
                "to": "Point B",
                "duration_seconds": 600,
                "duration_text": "10 min",
                "distance_meters": 5000,
                "distance_text": "5 km"
            }
        ]
        mock_get_optimizer.return_value = mock_optimizer
        
        response = client.post("/api/routes/details", json={
            "locations": ["Point A", "Point B"]
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "segments" in data
        assert len(data["segments"]) == 1


class TestTravelTimeCalculation:
    """Tests for travel time calculation."""

    @patch("backend.api.routes.get_optimizer")
    def test_calculate_travel_time(self, mock_get_optimizer):
        """Test travel time calculation between two points."""
        mock_optimizer = MagicMock()
        mock_optimizer.get_route_details.return_value = [
            {
                "duration_seconds": 1800,
                "duration_text": "30 min",
                "distance_meters": 15000,
                "distance_text": "15 km"
            }
        ]
        mock_get_optimizer.return_value = mock_optimizer
        
        response = client.get("/api/routes/calculate?origin=San Francisco&destination=Oakland")
        
        assert response.status_code == 200
        data = response.json()
        assert data["duration_seconds"] == 1800
