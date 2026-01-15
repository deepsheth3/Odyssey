from fastapi.testclient import TestClient
from backend.api.main import app
from backend.core.database import Base, engine, get_db
from backend.models.db import User
from sqlalchemy.orm import Session
import pytest

# Reset DB for tests
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_auth_flow_and_history():
    # 1. Register
    reg_res = client.post("/api/auth/register", json={
        "email": "test@odyssey.com",
        "password": "securepassword123"
    })
    assert reg_res.status_code == 200, f"Register failed: {reg_res.text}"
    
    # 2. Login
    login_res = client.post("/api/auth/token", data={
        "username": "test@odyssey.com",
        "password": "securepassword123"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Search with Token (Simulating History Save)
    # We mock the places service to avoid external calls and network issues
    from unittest.mock import patch, MagicMock
    with patch("backend.api.places.get_places_service") as mock_get_service:
        mock_service = MagicMock()
        mock_service.discover_places.return_value = [] # Return empty list is fine for history check
        mock_get_service.return_value = mock_service
        
        search_res = client.get(
            "/api/places/discover/San%20Francisco?limit=5", 
            headers=headers
        )
        assert search_res.status_code == 200, f"Search failed: {search_res.text}"
    
    # 4. Check History
    history_res = client.get("/api/users/me/history", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) > 0
    assert history[0]["city"] == "San Francisco"
    print("Authentication and History tracking verified!")

def test_image_fallback():
    # Test that fallback logic generates correct URLs
    from backend.services.places_service import PlacesService, FALLBACK_IMAGES
    from unittest.mock import patch, MagicMock

    # Mock settings and googlemaps Client
    with patch("backend.services.places_service.get_settings") as mock_settings_func, \
         patch("backend.services.places_service.googlemaps.Client") as mock_gmaps_client:
        
        mock_settings = MagicMock()
        mock_settings.GOOGLE_MAPS_API_KEY = "AIzaSyDummyKeyForTesting"
        mock_settings_func.return_value = mock_settings
        
        # Mock client instance
        mock_gmaps_client.return_value = MagicMock()
        
        service = PlacesService()
        
        # Case 1: No photo ref, type is 'park'
        data_park = {
            "place_id": "123",
            "name": "Mission Dolores Park",
            "types": ["park", "point_of_interest"]
        }
        place_park = service._parse_place(data_park)
        url_park = service.get_photo_url(place_park.photo_reference)
        assert "unsplash.com" in url_park
        assert url_park == FALLBACK_IMAGES["park"]
        
        # Case 2: No photo ref, unknown type
        data_unknown = {
            "place_id": "456",
            "name": "Mystery Spot",
            "types": ["mystery"]
        }
        place_unknown = service._parse_place(data_unknown)
        url_unknown = service.get_photo_url(place_unknown.photo_reference)
        assert "unsplash.com" in url_unknown
        
        print("Image fallback logic verified!")

if __name__ == "__main__":
    # Manually run if executed as script
    try:
        test_auth_flow_and_history()
        test_image_fallback()
        print("✅ All tests passed!")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
