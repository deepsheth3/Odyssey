// City data types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  slug: string;
  region: string;
  coordinates: Coordinates;
  description: string;
  image: string;
  tags: string[];
}

export interface CitiesData {
  cities: City[];
}

// Place types from backend
export interface Place {
  id: string;
  name: string;
  summary?: string;
  rating?: number;
  userRatingsTotal?: number;
  address?: string;
  coordinates?: Coordinates;
  photoUrl?: string;
  types: string[];
  priceLevel?: number;
  vibeScore?: number;
  duration?: number; // minutes to spend here
}

// User preferences
export type ActivityType = 
  | 'outdoor'
  | 'cultural'
  | 'food'
  | 'nightlife'
  | 'shopping'
  | 'relaxation'
  | 'adventure'
  | 'photography';

export type PriceRange = 'free' | 'budget' | 'moderate' | 'upscale' | 'luxury';

export type TravelPace = 'relaxed' | 'moderate' | 'packed';

export interface UserPreferences {
  activities: ActivityType[];
  priceRange: PriceRange;
  pace: TravelPace;
  startTime: string;
  endTime: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds: boolean;
  hasCar: boolean;
}

// Itinerary types
export interface ItineraryStop {
  place: Place;
  arrivalTime: string;
  departureTime: string;
  travelTimeToNext?: number; // minutes
  distanceToNext?: number; // km
}

export interface Itinerary {
  id: string;
  city: City;
  date: string;
  stops: ItineraryStop[];
  totalDistance: number; // km
  totalDuration: number; // minutes including travel
}
