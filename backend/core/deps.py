from typing import Optional
from fastapi import Request, Depends
from sqlalchemy.orm import Session
from backend.core.security import get_current_user, oauth2_scheme, get_secret_key, ALGORITHM
from backend.core.database import get_db
from backend.models.db import User, SearchHistory
from jose import jwt, JWTError


async def get_current_user_optional(
    request: Request, 
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get the current user if a valid token is present, otherwise return None.
    Does not raise generic 401.
    """
    token = request.headers.get("Authorization")
    if not token:
        return None
    
    try:
        scheme, _, param = token.partition(" ")
        if scheme.lower() != "bearer":
            return None
        
        payload = jwt.decode(param, get_secret_key(), algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        
        user = db.query(User).filter(User.email == email).first()
        return user
    except (JWTError, Exception):
        return None

