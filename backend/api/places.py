"""
Places API - Endpoints for discovering and searching places.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.services.places_service import get_places_service, PLACE_TYPES
from backend.services.cache_service import get_cache
from backend.core.logging import get_logger
from pydantic import BaseModel

logger = get_logger('Odyssey.places_api')

router = APIRouter(prefix="/api/places", tags=["places"])


class CityAutocompleteResult(BaseModel):
    name: str
    place_id: str
    description: str
    full_description: str


class CityAutocompleteResponse(BaseModel):
    query: str
    count: int
    cities: List[CityAutocompleteResult]


@router.get("/autocomplete")
async def autocomplete_cities(
    q: str = Query(..., min_length=1, description="Partial city name to search for")
) -> CityAutocompleteResponse:
    """
    Autocomplete California cities using Google Places API.
    
    As the user types, this returns matching California cities.
    Use this for dynamic city search instead of a static city list.
    """
    try:
        service = get_places_service()
        cities = service.autocomplete_cities(query=q)
        
        return CityAutocompleteResponse(
            query=q,
            count=len(cities),
            cities=[CityAutocompleteResult(**city) for city in cities]
        )
        
    except Exception as e:
        logger.error(f"Error in city autocomplete: {e}")
        raise HTTPException(status_code=500, detail=f"Autocomplete failed: {str(e)}")


class PlaceResponse(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    rating: Optional[float] = None
    user_rating_total: Optional[int] = None
    types: List[str] = []
    photo_url: Optional[str] = None
    summary: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class DiscoverResponse(BaseModel):
    city: str
    count: int
    places: List[PlaceResponse]
    categories: List[str]


@router.get("/discover/{city}")
async def discover_places(
    city: str,
    categories: Optional[str] = Query(None, description="Comma-separated categories: attractions,restaurants,cafes,outdoor,culture,nightlife,shopping"),
    limit: int = Query(20, ge=1, le=50, description="Max number of places to return")
) -> DiscoverResponse:
    """
    Discover popular places in a city.
    
    Categories available:
    - attractions: Tourist attractions and landmarks
    - restaurants: Restaurants and eateries
    - cafes: Coffee shops and bakeries
    - outdoor: Parks and nature areas
    - culture: Museums and galleries
    - nightlife: Bars and clubs
    - shopping: Malls and stores
    """
    try:
        service = get_places_service()
        
        # Parse categories
        cat_list = categories.split(",") if categories else None
        
        # Validate categories
        if cat_list:
            invalid = [c for c in cat_list if c not in PLACE_TYPES]
            if invalid:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid categories: {invalid}. Valid: {list(PLACE_TYPES.keys())}"
                )
        
        # Add state suffix if not present
        city_query = city if "," in city else f"{city}, CA"
        
        logger.info(f"Discovering places in {city_query}, categories: {cat_list}")
        
        places = service.discover_places(
            city=city_query,
            categories=cat_list,
            max_results=limit
        )
        
        # Convert to response format
        place_responses = []
        for p in places:
            photo_url = None
            if p.photo_reference:
                photo_url = service.get_photo_url(p.photo_reference)
            
            place_responses.append(PlaceResponse(
                id=p.id,
                name=p.name,
                address=p.address,
                rating=p.rating,
                user_rating_total=p.user_rating_total,
                types=p.types,
                photo_url=photo_url,
                summary=p.summary,
                lat=p.coordinates.lat if p.coordinates else None,
                lng=p.coordinates.lng if p.coordinates else None
            ))
        
        return DiscoverResponse(
            city=city_query,
            count=len(place_responses),
            places=place_responses,
            categories=cat_list or ["attractions", "restaurants"]
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error discovering places: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to discover places: {str(e)}")


@router.get("/search")
async def search_places(
    q: str = Query(..., min_length=2, description="Search query"),
    city: str = Query("San Francisco", description="City to search in")
) -> List[PlaceResponse]:
    """
    Search for places matching a query.
    """
    try:
        service = get_places_service()
        city_query = city if "," in city else f"{city}, CA"
        
        logger.info(f"Searching '{q}' in {city_query}")
        
        places = service.search_places(query=q, city=city_query)
        
        return [
            PlaceResponse(
                id=p.id,
                name=p.name,
                address=p.address,
                rating=p.rating,
                user_rating_total=p.user_rating_total,
                types=p.types,
                photo_url=service.get_photo_url(p.photo_reference) if p.photo_reference else None,
                summary=p.summary,
                lat=p.coordinates.lat if p.coordinates else None,
                lng=p.coordinates.lng if p.coordinates else None
            )
            for p in places
        ]
        
    except Exception as e:
        logger.error(f"Error searching places: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/detail/{place_id}")
async def get_place_detail(place_id: str) -> PlaceResponse:
    """
    Get detailed information about a specific place.
    """
    try:
        service = get_places_service()
        place = service.get_place_details(place_id)
        
        if not place:
            raise HTTPException(status_code=404, detail="Place not found")
        
        return PlaceResponse(
            id=place.id,
            name=place.name,
            address=place.address,
            rating=place.rating,
            user_rating_total=place.user_rating_total,
            types=place.types,
            photo_url=service.get_photo_url(place.photo_reference) if place.photo_reference else None,
            summary=place.summary,
            lat=place.coordinates.lat if place.coordinates else None,
            lng=place.coordinates.lng if place.coordinates else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting place detail: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get place: {str(e)}")


@router.get("/categories")
async def get_categories() -> dict:
    """
    Get available place categories.
    """
    return {
        "categories": list(PLACE_TYPES.keys()),
        "descriptions": {
            "attractions": "Tourist attractions and landmarks",
            "restaurants": "Restaurants and eateries",
            "cafes": "Coffee shops and bakeries",
            "outdoor": "Parks, trails, and nature areas",
            "culture": "Museums, galleries, and cultural sites",
            "nightlife": "Bars, clubs, and entertainment",
            "shopping": "Malls, stores, and markets",
            "viewpoints": "Scenic viewpoints and lookouts"
        }
    }


@router.get("/cache-stats")
async def get_cache_stats() -> dict:
    """
    Get cache statistics (for debugging).
    """
    cache = get_cache()
    return cache.get_stats()
