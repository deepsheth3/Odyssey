from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class ActivityType(Enum):
    OUTDOOR = 'outdoor'
    CULTURAL = 'cultural'
    SHOPPING = 'shopping'
    NIGHTLIFE = 'nightlife'
    RESTAURANTS = 'restaurants'
    RELAXATION = 'relaxation'
    PHOTOGRAPHY = 'photography'
    ADVENTURE = 'adventure'
    FOOD = 'food'

class PriceRange(str, Enum):
    FREE = 'free'
    BUDGET = 'budget'
    MODERATE = 'moderate'
    UPSCALE = 'upscale'
    LUXURY = 'luxury'

class TravelPace(str, Enum):
    RELAXED = 'relaxed'
    MODERATE = 'moderate'
    PACKED = 'packed'

class UserPreference(BaseModel):
    activities: List[ActivityType]
    price_range: PriceRange = PriceRange.BUDGET
    travel_pace: TravelPace = TravelPace.MODERATE
    start_time: str = '9:00'
    end_time: str = '21:00'
    dietary_restrictions: Optional[List[str]] = None
    accessibility_needs: bool = False
    has_car: bool = True

