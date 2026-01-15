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

# Fallback images for checks where Google doesn't return a photo
FALLBACK_IMAGES = {
    "park": "https://images.unsplash.com/photo-1519331379826-fcb5c14514e9?w=600",
    "restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
    "cafe": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
    "bar": "https://images.unsplash.com/photo-1514362545857-3bc16549766b?w=600",
    "store": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
    "museum": "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=600",
    "tourist_attraction": "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600",
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
    
    def search_places(
        self, 
        query: str, 
        city: str,
        place_type: Optional[str] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        open_now: Optional[bool] = None,
        min_rating: Optional[float] = None
    ) -> List[Place]:
        """
        Search for places matching a query in a city with optional filters.
        """
        # Include filters in cache key
        cache_k = cache_key("search", query, city, place_type, min_price, max_price, open_now)
        cached = self.cache.get(cache_k)
        if cached:
            places = [Place(**p) for p in cached]
            # Apply post-fetch rating filter on cached results
            if min_rating:
                places = [p for p in places if (p.rating or 0) >= min_rating]
            return places
        
        try:
            # Build arguments for Google Places API
            search_query = f"{query} in {city}"
            kwargs = {'query': search_query}
            
            if place_type:
                kwargs['type'] = place_type
            if min_price is not None:
                kwargs['min_price'] = min_price
            if max_price is not None:
                kwargs['max_price'] = max_price
            if open_now:
                kwargs['open_now'] = True
                
            results = self.client.places(**kwargs)
            places = []
            
            for result in results.get("results", [])[:20]:
                place = self._parse_place(result)
                if place:
                    # Filter by rating manually as API doesn't support it directly in text search?
                    # Actually API doesn't, so we filter here.
                    if min_rating and (place.rating or 0) < min_rating:
                        continue
                    places.append(place)
            
            # Cache the RAW results (before rating filter? No, cache the valid ones? 
            # Better to cache the API response result, but we parse first.
            # Let's cache the parsed list.
            self.cache.set(cache_k, [p.model_dump() for p in places])
            
            return places
            
        except Exception as e:
            logger.error(f"Error searching '{query}' in {city}: {e}")
            return []
    
    def _parse_place(self, data: Dict[str, Any]) -> Optional[Place]:
        """Parse a place from API response."""
        try:
            location = data.get("geometry", {}).get("location", {})
            
            # Get photo reference or fallback
            photos = data.get("photos", [])
            photo_ref = photos[0].get("photo_reference") if photos else None
            
            # Note: We return None for photo_reference if it's missing,
            # but the API response conversion will handle generating a URL for us?
            # Actually, `get_photo_url` is called in the API layer.
            # We should probably handle fallback there or store a 'fallback_url' string in Place?
            # Place model has 'photo_reference' which is a string. 
            # Let's override behaviors at the API layer or modify Place model?
            # Easier: if we stick a specially formatted string in photo_reference,
            # get_photo_url can detect it.
            
            if not photo_ref:
                # Find matching type for fallback
                place_types = data.get("types", [])
                for t in place_types:
                    if t in FALLBACK_IMAGES:
                        photo_ref = f"FALLBACK:{FALLBACK_IMAGES[t]}"
                        break
                # Default generic fallback if no specific type match
                if not photo_ref:
                    photo_ref = "FALLBACK:https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600"

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
    
    def autocomplete_cities(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Autocomplete California cities using Google Places API.
        
        Args:
            query: Partial city name to search for
            max_results: Maximum number of suggestions to return
        
        Returns:
            List of city suggestions with name, place_id, and description
        """
        cache_k = cache_key("autocomplete_city", query.lower())
        cached = self.cache.get(cache_k)
        if cached:
            logger.debug(f"Returning cached autocomplete for '{query}'")
            return cached
        
        try:
            # Use places_autocomplete with California restriction
            results = self.client.places_autocomplete(
                input_text=query,
                types="(cities)",
                components={"country": "us"},
                # Bias toward California center
                location=(36.7783, -119.4179),
                radius=500000  # ~500km radius covering California
            )
            
            # Filter to California cities only and format response
            cities = []
            for result in results[:max_results]:
                description = result.get("description", "")
                # Filter to only California results
                if ", CA," in description or description.endswith(", CA") or "California" in description:
                    # Extract just the city name
                    main_text = result.get("structured_formatting", {}).get("main_text", "")
                    secondary_text = result.get("structured_formatting", {}).get("secondary_text", "")
                    
                    cities.append({
                        "name": main_text,
                        "place_id": result.get("place_id"),
                        "description": secondary_text or "California",
                        "full_description": description
                    })
            
            # Cache for 1 hour (autocomplete results don't change often)
            self.cache.set(cache_k, cities, ttl=3600)
            logger.info(f"Autocomplete '{query}' returned {len(cities)} California cities")
            
            return cities
            
        except Exception as e:
            logger.error(f"Error in city autocomplete for '{query}': {e}")
            return []
    
    def get_photo_url(self, photo_reference: str, max_width: int = 400) -> str:
        """
        Get a URL for a place photo.
        
        Args:
            photo_reference: Photo reference from Places API
            max_width: Maximum width of the image
        
        Returns:
            URL string for the photo
        """
        if photo_reference.startswith("FALLBACK:"):
            return photo_reference.replace("FALLBACK:", "")

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
