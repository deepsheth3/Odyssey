from pydantic import BaseModel
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class Place(BaseModel):
    id: str
    name: str
    summary: Optional[str] = None
    rating: Optional[float] = None
    user_rating_total: Optional[int] = None
    address: Optional[str] = None
    coordinates: Optional[Coordinates] = None
    photo_reference: Optional[str] = None
    types: List[str] = []

    vibe_score: Optional[float] = 0.0

