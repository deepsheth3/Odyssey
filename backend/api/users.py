from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from backend.core.database import get_db
from backend.models.db import SearchHistory
from backend.core.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

class SearchHistoryResponse(BaseModel):
    city: str
    query: str | None
    timestamp: datetime

    class Config:
        from_attributes = True

@router.get("/me/history", response_model=List[SearchHistoryResponse])
def get_my_history(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.searches
