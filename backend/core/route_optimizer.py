"""
Route Optimization Service
Uses Google Maps APIs to calculate optimal routes and travel times.
"""

import googlemaps
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import itertools

load_dotenv()

class Location(BaseModel):
    name: str
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None

class RouteStop(BaseModel):
    location: Location
    arrival_time: Optional[str] = None
    duration_from_previous: Optional[int] = None  # in seconds

class RouteResult(BaseModel):
    stops: List[RouteStop]
    total_duration: int  # Total travel time in seconds
    total_distance: int  # Total distance in meters
    optimized: bool
    time_saved: int  # Time saved compared to original order (in seconds)

class RouteOptimizer:
    def __init__(self):
        api_key = os.getenv("GOOGLE_MAPS_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_MAPS_API_KEY not found in environment variables")
        self.client = googlemaps.Client(key=api_key)
    
    def get_distance_matrix(self, origins: List[str], destinations: List[str]) -> Dict:
        """
        Get distance and duration matrix between multiple origins and destinations.
        """
        result = self.client.distance_matrix(
            origins=origins,
            destinations=destinations,
            mode="driving",
            units="metric"
        )
        return result
    
    def calculate_route_duration(self, locations: List[str]) -> Tuple[int, int]:
        """
        Calculate total duration and distance for a route visiting locations in order.
        Returns (total_duration_seconds, total_distance_meters)
        """
        if len(locations) < 2:
            return (0, 0)
        
        total_duration = 0
        total_distance = 0
        
        for i in range(len(locations) - 1):
            matrix = self.get_distance_matrix([locations[i]], [locations[i + 1]])
            element = matrix['rows'][0]['elements'][0]
            
            if element['status'] == 'OK':
                total_duration += element['duration']['value']
                total_distance += element['distance']['value']
        
        return (total_duration, total_distance)
    
    def optimize_route(self, start: str, stops: List[str], end: Optional[str] = None) -> Dict:
        """
        Find the optimal order to visit all stops, minimizing total travel time.
        Uses Distance Matrix API to get all pairwise distances, then finds best order.
        
        Args:
            start: Starting location address
            stops: List of stop addresses to visit
            end: Optional ending location (defaults to start for round trip)
        
        Returns:
            Dict with optimized order, total time, and time saved
        """
        if end is None:
            end = start
        
        # Get all locations
        all_locations = [start] + stops + ([end] if end != start else [])
        
        # Get distance matrix for all pairs
        matrix_result = self.get_distance_matrix(all_locations, all_locations)
        
        # Parse matrix into usable format
        n = len(all_locations)
        durations = [[0] * n for _ in range(n)]
        distances = [[0] * n for _ in range(n)]
        
        for i, row in enumerate(matrix_result['rows']):
            for j, element in enumerate(row['elements']):
                if element['status'] == 'OK':
                    durations[i][j] = element['duration']['value']
                    distances[i][j] = element['distance']['value']
                else:
                    # If route not found, use a very high value
                    durations[i][j] = float('inf')
                    distances[i][j] = float('inf')
        
        # Calculate original route duration (in order provided)
        original_duration = 0
        original_distance = 0
        original_order = list(range(len(all_locations)))
        
        for i in range(len(original_order) - 1):
            original_duration += durations[original_order[i]][original_order[i + 1]]
            original_distance += distances[original_order[i]][original_order[i + 1]]
        
        # If round trip, add return to start
        if end == start:
            original_duration += durations[original_order[-1]][0]
            original_distance += distances[original_order[-1]][0]
        
        # Find optimal order using brute force for small number of stops
        # For larger sets, we'd use a proper TSP algorithm
        stop_indices = list(range(1, len(stops) + 1))  # Indices of stops (excluding start/end)
        
        best_order = None
        best_duration = float('inf')
        best_distance = 0
        
        # Try all permutations of stops
        for perm in itertools.permutations(stop_indices):
            # Build full route: start -> permuted stops -> end
            if end == start:
                route = [0] + list(perm)  # Will return to start
            else:
                route = [0] + list(perm) + [len(all_locations) - 1]
            
            # Calculate total duration for this order
            total_dur = 0
            total_dist = 0
            for i in range(len(route) - 1):
                total_dur += durations[route[i]][route[i + 1]]
                total_dist += distances[route[i]][route[i + 1]]
            
            # Add return to start if round trip
            if end == start:
                total_dur += durations[route[-1]][0]
                total_dist += distances[route[-1]][0]
            
            if total_dur < best_duration:
                best_duration = total_dur
                best_distance = total_dist
                best_order = route
        
        # Build result with optimized order
        optimized_stops = [all_locations[i] for i in best_order]
        
        return {
            "original_order": [all_locations[i] for i in original_order],
            "optimized_order": optimized_stops,
            "original_duration_seconds": original_duration,
            "optimized_duration_seconds": best_duration,
            "time_saved_seconds": original_duration - best_duration,
            "original_distance_meters": original_distance,
            "optimized_distance_meters": best_distance,
            "distance_saved_meters": original_distance - best_distance
        }
    
    def get_route_details(self, locations: List[str]) -> List[Dict]:
        """
        Get detailed route information including duration between each stop.
        """
        if len(locations) < 2:
            return []
        
        details = []
        for i in range(len(locations) - 1):
            matrix = self.get_distance_matrix([locations[i]], [locations[i + 1]])
            element = matrix['rows'][0]['elements'][0]
            
            details.append({
                "from": locations[i],
                "to": locations[i + 1],
                "duration_seconds": element['duration']['value'] if element['status'] == 'OK' else None,
                "duration_text": element['duration']['text'] if element['status'] == 'OK' else None,
                "distance_meters": element['distance']['value'] if element['status'] == 'OK' else None,
                "distance_text": element['distance']['text'] if element['status'] == 'OK' else None,
            })
        
        return details


# Singleton instance
_optimizer = None

def get_optimizer() -> RouteOptimizer:
    global _optimizer
    if _optimizer is None:
        _optimizer = RouteOptimizer()
    return _optimizer
