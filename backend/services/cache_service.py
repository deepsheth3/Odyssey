"""
In-memory cache service for MVP.
Will be replaced with Redis in production.
"""

from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import json
from backend.core.logging import get_logger

logger = get_logger('Odyssey.cache')


class CacheEntry:
    """A single cache entry with expiration."""
    def __init__(self, value: Any, ttl_seconds: int):
        self.value = value
        self.expires_at = datetime.now() + timedelta(seconds=ttl_seconds)
    
    def is_expired(self) -> bool:
        return datetime.now() > self.expires_at


class InMemoryCache:
    """
    Simple in-memory cache with TTL support.
    Thread-safe for basic usage.
    """
    
    def __init__(self, default_ttl: int = 604800):  # 7 days default
        self._cache: Dict[str, CacheEntry] = {}
        self.default_ttl = default_ttl
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache if it exists and hasn't expired."""
        entry = self._cache.get(key)
        
        if entry is None:
            self.misses += 1
            return None
        
        if entry.is_expired():
            del self._cache[key]
            self.misses += 1
            logger.debug(f"Cache expired: {key}")
            return None
        
        self.hits += 1
        logger.debug(f"Cache hit: {key}")
        return entry.value
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Store a value in cache with optional custom TTL."""
        ttl = ttl or self.default_ttl
        self._cache[key] = CacheEntry(value, ttl)
        logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
    
    def delete(self, key: str) -> bool:
        """Remove a key from cache. Returns True if key existed."""
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cached entries."""
        self._cache.clear()
        logger.info("Cache cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            "entries": len(self._cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate:.1f}%"
        }
    
    def cleanup_expired(self) -> int:
        """Remove all expired entries. Returns count of removed entries."""
        expired_keys = [
            key for key, entry in self._cache.items() 
            if entry.is_expired()
        ]
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
        
        return len(expired_keys)


# Singleton cache instance
_cache: Optional[InMemoryCache] = None


def get_cache() -> InMemoryCache:
    """Get the singleton cache instance."""
    global _cache
    if _cache is None:
        _cache = InMemoryCache()
    return _cache


def cache_key(*parts: str) -> str:
    """Generate a cache key from multiple parts."""
    return ":".join(str(p).lower().replace(" ", "_") for p in parts)
