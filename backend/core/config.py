"""
Configuration settings for Odyssey backend.
Uses pydantic-settings to load from environment variables.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Security (CRITICAL - must be set in production)
    SECRET_KEY: str = ""  # Must be set via environment variable
    
    # CORS Origins (comma-separated in env var)
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Google APIs
    GOOGLE_MAPS_API_KEY: str = ""
    GOOGLE_PLACES_API_KEY: str = ""  # Can be same as Maps key
    
    # OpenAI (for AI recommendations)
    OPENAI_API_KEY: str = ""
    
    # Pinecone (for vector search)
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = "us-east-1"
    PINECONE_INDEX_NAME: str = "odyssey-places"
    
    # Redis (for production caching)
    REDIS_URL: str = "redis://localhost:6379"
    
    # App settings
    ENVIRONMENT: str = "development"
    DEFAULT_CITY: str = "san-francisco"
    CACHE_TTL_SECONDS: int = 604800  # 7 days
    
    # API limits
    MAX_PLACES_PER_SEARCH: int = 20
    MAX_PLACE_SELECTIONS: int = 10

    # Rate Limiting
    RATE_LIMIT_GLOBAL: str = "100/minute"
    RATE_LIMIT_EXPENSIVE: str = "10/minute"

    @property
    def cors_origins_list(self) -> list:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
