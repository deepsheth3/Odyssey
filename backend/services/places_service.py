"""
Places Service - Google Places API integration.
Fetches POIs for California cities with caching.
"""

import googlemaps
from typing import List, Dict, Any, Optional
from backend.core.config import get_settings
from backend.core.logging import get_logger
from backend.services.cache_service import get_cache, cache_key
from backend.models.place import Place, Coordinates

logger = get_logger('Odyssey.places')

# Place type mappings for different categories
PLACE_TYPES = {
    "attractions": ["tourist_attraction", "point_of_interest", "landmark"],
    "restaurants": ["restaurant", "meal_takeaway", "meal_delivery"],
    "cafes": ["cafe", "bakery", "coffee_shop"],
    "outdoor": ["park", "natural_feature", "campground", "hiking_area"],
    "culture": ["museum", "art_gallery", "library"],
    "nightlife": ["bar", "night_club", "casino"],
    "shopping": ["shopping_mall", "store", "clothing_store"],
    "viewpoints": ["viewpoint", "observation_deck"],
}


class PlacesService:
    """
    Service for discovering and fetching places using Google Places API.
    Implements aggressive caching to minimize API costs.
    """
    
    def __init__(self):
        settings = get_settings()
        api_key = settings.GOOGLE_MAPS_API_KEY or settings.GOOGLE_PLACES_API_KEY
        if not api_key:
            raise ValueError("No Google API key configured")
        
        self.client = googlemaps.Client(key=api_key)
        self.cache = get_cache()
        self.settings = settings
    
    def discover_places(
        self, 
        city: str, 
        categories: Optional[List[str]] = None,
        max_results: int = 20
    ) -> List[Place]:
        """
        Discover places in a city, optionally filtered by categories.
        
        Args:
            city: City name (e.g., "San Francisco, CA")
            categories: List of category keys from PLACE_TYPES
            max_results: Maximum number of places to return
        
        Returns:
            List of Place objects
        """
        # Check cache first
        cache_k = cache_key("discover", city, str(categories))
        cached = self.cache.get(cache_k)
        if cached:
            logger.info(f"Returning cached places for {city}")
            return [Place(**p) for p in cached]
        
        # Determine which place types to search
        if categories:
            place_types = []
            for cat in categories:
                place_types.extend(PLACE_TYPES.get(cat, []))
        else:
            # Default: search attractions and restaurants
            place_types = PLACE_TYPES["attractions"] + PLACE_TYPES["restaurants"]
        
        # Search for places
        all_places = []
        seen_ids = set()
        
        for place_type in place_types[:3]:  # Limit to 3 types to save API calls
            try:
                results = self.client.places(
                    query=f"{place_type} in {city}",
                    type=place_type
                )
                
                for result in results.get("results", [])[:max_results]:
                    place_id = result.get("place_id")
                    if place_id and place_id not in seen_ids:
                        seen_ids.add(place_id)
                        place = self._parse_place(result)
                        if place:
                            all_places.append(place)
                            
            except Exception as e:
                logger.error(f"Error searching {place_type}: {e}")
                continue
        
        # Sort by rating and popularity
        all_places.sort(
            key=lambda p: (p.rating or 0) * (1 + (p.user_rating_total or 0) / 10000),
            reverse=True
        )
        
        # Limit results
        all_places = all_places[:max_results]
        
        # Cache the results
        self.cache.set(cache_k, [p.model_dump() for p in all_places])
        logger.info(f"Cached {len(all_places)} places for {city}")
        
        return all_places
    
    def get_place_details(self, place_id: str) -> Optional[Place]:
        """
        Get detailed information about a specific place.
        
        Args:
            place_id: Google Place ID
        
        Returns:
            Place object with full details
        """
        # Check cache
        cache_k = cache_key("place", place_id)
        cached = self.cache.get(cache_k)
        if cached:
            return Place(**cached)
        
        try:
            result = self.client.place(
                place_id=place_id,
                fields=[
                    "place_id", "name", "formatted_address", "geometry",
                    "rating", "user_ratings_total", "types", "photos",
                    "opening_hours", "price_level", "website", "formatted_phone_number"
                ]
            )
            
            place_data = result.get("result", {})
            place = self._parse_place_details(place_data)
            
            if place:
                self.cache.set(cache_k, place.model_dump())
            
            return place
            
        except Exception as e:
            logger.error(f"Error fetching place details for {place_id}: {e}")
            return None
    
    def search_places(self, query: str, city: str) -> List[Place]:
        """
        Search for places matching a query in a city.
        
        Args:
            query: Search query (e.g., "best tacos")
            city: City name
        
        Returns:
            List of matching places
        """
        cache_k = cache_key("search", query, city)
        cached = self.cache.get(cache_k)
        if cached:
            return [Place(**p) for p in cached]
        
        try:
            results = self.client.places(query=f"{query} in {city}")
            places = []
            
            for result in results.get("results", [])[:10]:
                place = self._parse_place(result)
                if place:
                    places.append(place)
            
            self.cache.set(cache_k, [p.model_dump() for p in places])
            return places
            
        except Exception as e:
            logger.error(f"Error searching '{query}' in {city}: {e}")
            return []
    
    def _parse_place(self, data: Dict[str, Any]) -> Optional[Place]:
        """Parse a place from API response."""
        try:
            location = data.get("geometry", {}).get("location", {})
            
            # Get photo reference if available
            photos = data.get("photos", [])
            photo_ref = photos[0].get("photo_reference") if photos else None
            
            return Place(
                id=data.get("place_id", ""),
                name=data.get("name", ""),
                address=data.get("formatted_address") or data.get("vicinity", ""),
                coordinates=Coordinates(
                    lat=location.get("lat", 0),
                    lng=location.get("lng", 0)
                ) if location else None,
                rating=data.get("rating"),
                user_rating_total=data.get("user_ratings_total"),
                types=data.get("types", []),
                photo_reference=photo_ref,
            )
        except Exception as e:
            logger.error(f"Error parsing place: {e}")
            return None
    
    def _parse_place_details(self, data: Dict[str, Any]) -> Optional[Place]:
        """Parse detailed place from API response."""
        place = self._parse_place(data)
        if place:
            # Add extra details
            place.summary = self._generate_summary(data)
        return place
    
    def _generate_summary(self, data: Dict[str, Any]) -> str:
        """Generate a brief summary for a place."""
        parts = []
        
        # Rating info
        rating = data.get("rating")
        total = data.get("user_ratings_total", 0)
        if rating:
            parts.append(f"Rated {rating}★")
            if total > 100:
                parts.append(f"({total:,} reviews)")
        
        # Price level
        price = data.get("price_level")
        if price:
            parts.append("$" * price)
        
        return " • ".join(parts) if parts else ""
    
    def get_photo_url(self, photo_reference: str, max_width: int = 400) -> str:
        """
        Get a URL for a place photo.
        
        Args:
            photo_reference: Photo reference from Places API
            max_width: Maximum width of the image
        
        Returns:
            URL string for the photo
        """
        settings = get_settings()
        api_key = settings.GOOGLE_MAPS_API_KEY
        return (
            f"https://maps.googleapis.com/maps/api/place/photo"
            f"?maxwidth={max_width}"
            f"&photo_reference={photo_reference}"
            f"&key={api_key}"
        )


# Singleton instance
_places_service: Optional[PlacesService] = None


def get_places_service() -> PlacesService:
    """Get the singleton PlacesService instance."""
    global _places_service
    if _places_service is None:
        _places_service = PlacesService()
    return _places_service
