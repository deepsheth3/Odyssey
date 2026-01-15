from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from backend.models.user_preferance import UserPreference, ActivityType, PriceRange, TravelPace
from backend.services.places_service import get_places_service
from backend.services.recommendation_system import get_recommendation_service
from backend.core.logging import get_logger

logger = get_logger('Odyssey.recommend_api')

router = APIRouter(prefix='/api/recommend', tags=['Recommendation'])


class RecommendRequest(BaseModel):
    city: str
    user_preference: UserPreference


class RecommendedPlace(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    rating: Optional[float] = None
    photo_url: Optional[str] = None
    score: float
    reasons: List[str]


class RecommendResponse(BaseModel):
    city: str
    count: int
    recommendations: List[RecommendedPlace]


@router.post('/')
async def get_recommendations(request: RecommendRequest) -> RecommendResponse:
    """Get personalized place recommendations based on preferences."""
    try:
        places_service = get_places_service()
        rec_service = get_recommendation_service()

        # Map activities to place categories
        categories = _map_activities_to_categories(request.user_preference.activities)

        city_query = request.city
        logger.info(f'Getting recommendations for {city_query}')
        
        places = places_service.discover_places(
            city=city_query,
            categories=categories,
            max_results=50
        )

        # Get recommendations
        scored = rec_service.recommend(
            places=places,
            perferances=request.user_preference,
            limit=15
        )

        # Build response
        recommendations = []
        for item in scored:
            place = item['place']
            photo_url = None
            if place.photo_reference:
                photo_url = places_service.get_photo_url(place.photo_reference)

            recommendations.append(RecommendedPlace(
                id=place.id,
                name=place.name,
                address=place.address,
                rating=place.rating,
                photo_url=photo_url,
                score=round(item['score'], 1),
                reasons=item['reasons']
            ))
        
        return RecommendResponse(
            city=city_query,
            count=len(recommendations),
            recommendations=recommendations
        )
        
    except Exception as e:
        logger.error(f'Failed to get recommendations: {e}')
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/activity-types')
async def get_activity_types():
    """Get available activity types."""
    return {
        'activities': [
            {
                'value': a.value, 
                'label': a.value.title()
            } for a in ActivityType
        ]
    }


@router.get('/price-ranges')
async def get_price_ranges():
    """Get available price ranges."""
    return {
        "ranges": [
            {"value": "free", "label": "Free"},
            {"value": "budget", "label": "Budget ($0-25)"},
            {"value": "moderate", "label": "Moderate ($25-75)"},
            {"value": "upscale", "label": "Upscale ($75-150)"},
            {"value": "expensive", "label": "Expensive ($150+)"},
        ]
    }


def _map_activities_to_categories(activities: List[ActivityType]) -> List[str]:
    """Map user activity preferences to place categories."""
    mapping = {
        ActivityType.OUTDOOR: "outdoor",
        ActivityType.CULTURAL: "culture",
        ActivityType.FOOD: "restaurants",
        ActivityType.NIGHTLIFE: "nightlife",
        ActivityType.SHOPPING: "shopping",
        ActivityType.PHOTOGRAPHY: "attractions",
        ActivityType.ADVENTURE: "outdoor",
        ActivityType.RELAXATION: "cafes",
        ActivityType.RESTAURANTS: "restaurants",
    }
    
    categories = []
    for activity in activities:
        cat = mapping.get(activity)
        if cat and cat not in categories:
            categories.append(cat)
    
    return categories if categories else ["attractions", "restaurants"]
