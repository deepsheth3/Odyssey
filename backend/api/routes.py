"""
Routes API - Endpoints for route optimization and travel time calculation.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.core.route_optimizer import get_optimizer
from backend.core.logging import get_logger

logger = get_logger('Odyssey.routes')

router = APIRouter(prefix="/api/routes", tags=["routes"])


class OptimizeRouteRequest(BaseModel):
    start: str  # Starting location address
    stops: List[str]  # List of stop addresses
    end: Optional[str] = None  # Optional end location (defaults to start)


class RouteDetailsRequest(BaseModel):
    locations: List[str]  # Ordered list of locations


@router.post("/optimize")
async def optimize_route(request: OptimizeRouteRequest):
    """
    Optimize the order of stops to minimize total travel time.
    Returns the optimized order along with time and distance savings.
    """
    try:
        logger.info(f"Optimizing route with {len(request.stops)} stops")
        optimizer = get_optimizer()
        result = optimizer.optimize_route(
            start=request.start,
            stops=request.stops,
            end=request.end
        )
        
        # Convert seconds to human-readable format
        result["time_saved_formatted"] = format_duration(result["time_saved_seconds"])
        result["original_duration_formatted"] = format_duration(result["original_duration_seconds"])
        result["optimized_duration_formatted"] = format_duration(result["optimized_duration_seconds"])
        
        logger.info(f"Route optimized! Saved {result['time_saved_formatted']}")
        return result
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error optimizing route: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize route: {str(e)}")


@router.post("/details")
async def get_route_details(request: RouteDetailsRequest):
    """
    Get detailed travel information between each stop in the provided order.
    """
    try:
        logger.info(f"Getting route details for {len(request.locations)} locations")
        optimizer = get_optimizer()
        details = optimizer.get_route_details(request.locations)
        
        # Calculate totals
        total_duration = sum(d["duration_seconds"] or 0 for d in details)
        total_distance = sum(d["distance_meters"] or 0 for d in details)
        
        return {
            "segments": details,
            "total_duration_seconds": total_duration,
            "total_duration_formatted": format_duration(total_duration),
            "total_distance_meters": total_distance,
            "total_distance_formatted": format_distance(total_distance)
        }
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting route details: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get route details: {str(e)}")


@router.get("/calculate")
async def calculate_travel_time(origin: str, destination: str):
    """
    Calculate travel time between two locations.
    """
    try:
        optimizer = get_optimizer()
        details = optimizer.get_route_details([origin, destination])
        
        if details and details[0]["duration_seconds"]:
            return {
                "origin": origin,
                "destination": destination,
                "duration_seconds": details[0]["duration_seconds"],
                "duration_formatted": details[0]["duration_text"],
                "distance_meters": details[0]["distance_meters"],
                "distance_formatted": details[0]["distance_text"]
            }
        else:
            raise HTTPException(status_code=404, detail="Route not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating travel time: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate travel time: {str(e)}")


def format_duration(seconds: int) -> str:
    """Convert seconds to human-readable duration."""
    if seconds < 60:
        return f"{seconds} sec"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"{minutes} min"
    else:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        if minutes > 0:
            return f"{hours} hr {minutes} min"
        return f"{hours} hr"


def format_distance(meters: int) -> str:
    """Convert meters to human-readable distance."""
    if meters < 1000:
        return f"{meters} m"
    else:
        km = meters / 1000
        return f"{km:.1f} km"
