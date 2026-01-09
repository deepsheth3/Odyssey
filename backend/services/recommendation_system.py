"""
Recommendation Service - Rule-based scoring for places.
"""
import math
from typing import List, Dict, Any
from backend.models.user_preferance import UserPreference, ActivityType, PriceRange
from backend.models.place import Place
from backend.core.logging import get_logger
logger = get_logger('Odyssey.recommendations')

# Map Google place types to our activity types
TYPE_TO_ACTIVITY = {
    "park": ActivityType.OUTDOOR,
    "natural_feature": ActivityType.OUTDOOR,
    "campground": ActivityType.OUTDOOR,
    "hiking_area": ActivityType.OUTDOOR,
    "museum": ActivityType.CULTURAL,
    "art_gallery": ActivityType.CULTURAL,
    "library": ActivityType.CULTURAL,
    "restaurant": ActivityType.FOOD,
    "cafe": ActivityType.FOOD,
    "bakery": ActivityType.FOOD,
    "bar": ActivityType.NIGHTLIFE,
    "night_club": ActivityType.NIGHTLIFE,
    "shopping_mall": ActivityType.SHOPPING,
    "store": ActivityType.SHOPPING,
    "spa": ActivityType.RELAXATION,
    "tourist_attraction": ActivityType.PHOTOGRAPHY,
    "point_of_interest": ActivityType.ADVENTURE,
}

# Price level mapping (Google uses 0-4)
PRICE_LEVEL_MAP = {
    PriceRange.FREE: 0,
    PriceRange.BUDGET: 1,
    PriceRange.MODERATE: 2,
    PriceRange.UPSCALE: 3,
    PriceRange.LUXURY: 4,
}

class RecommendationService:
    """
    Rule-based recommendation engine.
    Scores places based on user preferences.
    """

    def recommend(self, places: List[Place], perferances: UserPreference, limit: int = 15) -> List[Dict[str, Any]]:
        """
        Recommend places based on user preferences.
        
        Returns list of places with scores and reasoning.
        """
        scored_places = []

        for place in places:
            score, reason = self._calculate_score(place, perferances)
            scored_places.append({
                'place': place,
                'score': score,
                'reasons': reason
            })
        
        # Sort by score descending
        scored_places.sort(key=lambda x: x['score'], reverse=True)

        # Return top N results
        return scored_places[:limit]

    def _calculate_score(self, place: Place, preference: UserPreference) -> tuple[float, List[str]]:
        """
        Calculate a recommendation score for a place
        """
        score = 0.0
        reasons = []

        # 1. Base score from Google rating (0-5 -> 0-25 points)
        if place.rating:
            rating_score = place.rating * 5
            score += rating_score
            if place.rating >= 4.5:
                reasons.append(f'Highly rated place with {place.rating} rating') 

        # 2. Activity match bonus (20 points per match)
        place_activities = self._get_activities(place.types)        
        matching = set(place_activities) & set(preference.activities)
        score += len(matching) * 20
        for activity in matching:
            reasons.append(f'Matches activity your interests: {activity.value}')
        
        # 3. Popularity bonus (log scale, max +15)
        if place.user_rating_total:
            pop_score = min(15, math.log(place.user_rating_total + 1) * 2)
            score += pop_score
            if place.user_rating_total > 1000:
                reasons.append("Very popular spot")
        
        # 4. Price alignment (+10 if within budget, -10 if over)
        # Note: We don't have price_level in our current Place model
        # This would need to be added from place details
        
        # 5. Penalty for no matching activities (-15)
        if not matching and preference.activities:
            score -= 15
        
        return score, reasons

    def _get_activities(self, types: List[str]) -> List[ActivityType]:
        """Map Google place types to our activity types."""
        activities = []
        for t in types:
            if t in TYPE_TO_ACTIVITY:
                activity = TYPE_TO_ACTIVITY[t]
                if activity not in activities:
                    activities.append(activity)
        return activities
# Singleton
_service = None
def get_recommendation_service() -> RecommendationService:
    global _service
    if _service is None:
        _service = RecommendationService()
    return _service