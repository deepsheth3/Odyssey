/**
 * API Service for Odyssey Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface OptimizeRouteRequest {
    start: string;
    stops: string[];
    end?: string | null;
}

export interface OptimizeRouteResponse {
    original_order: string[];
    optimized_order: string[];
    original_duration_seconds: number;
    optimized_duration_seconds: number;
    time_saved_seconds: number;
    time_saved_formatted: string;
    original_duration_formatted: string;
    optimized_duration_formatted: string;
    original_distance_meters: number;
    optimized_distance_meters: number;
    distance_saved_meters: number;
}

export interface RouteDetailsRequest {
    locations: string[];
}

export interface RouteSegment {
    from: string;
    to: string;
    duration_seconds: number | null;
    duration_text: string | null;
    distance_meters: number | null;
    distance_text: string | null;
}

export interface RouteDetailsResponse {
    segments: RouteSegment[];
    total_duration_seconds: number;
    total_duration_formatted: string;
    total_distance_meters: number;
    total_distance_formatted: string;
}

export interface TravelTimeResponse {
    origin: string;
    destination: string;
    duration_seconds: number;
    duration_formatted: string;
    distance_meters: number;
    distance_formatted: string;
}

/**
 * Optimize route order to minimize travel time
 */
export async function optimizeRoute(request: OptimizeRouteRequest): Promise<OptimizeRouteResponse> {
    const response = await fetch(`${API_BASE_URL}/api/routes/optimize`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`Failed to optimize route: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get detailed travel information between each stop
 */
export async function getRouteDetails(locations: string[]): Promise<RouteDetailsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/routes/details`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations }),
    });

    if (!response.ok) {
        throw new Error(`Failed to get route details: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Calculate travel time between two locations
 */
export async function getTravelTime(origin: string, destination: string): Promise<TravelTimeResponse> {
    const params = new URLSearchParams({ origin, destination });
    const response = await fetch(`${API_BASE_URL}/api/routes/calculate?${params}`);

    if (!response.ok) {
        throw new Error(`Failed to calculate travel time: ${response.statusText}`);
    }

    return response.json();
}

// ============================================
// Recommendation Types & Functions
// ============================================

export type ActivityType =
    | 'outdoor'
    | 'cultural'
    | 'food'
    | 'nightlife'
    | 'shopping'
    | 'relaxation'
    | 'adventure'
    | 'photography'
    | 'restaurants';

export type PriceRange = 'free' | 'budget' | 'moderate' | 'upscale' | 'luxury';
export type TravelPace = 'relaxed' | 'moderate' | 'packed';

export interface UserPreference {
    activities: ActivityType[];
    price_range: PriceRange;
    travel_pace: TravelPace;
    start_time: string;
    end_time: string;
    dietary_restrictions?: string[];
    accessibility_needs: boolean;
    has_car: boolean;
}

export interface RecommendRequest {
    city: string;
    user_preference: UserPreference;
}

export interface RecommendedPlace {
    id: string;
    name: string;
    address?: string;
    rating?: number;
    photo_url?: string;
    score: number;
    reasons: string[];
}

export interface RecommendResponse {
    city: string;
    count: number;
    recommendations: RecommendedPlace[];
}

/**
 * Get personalized recommendations based on preferences
 */
export async function getRecommendations(request: RecommendRequest): Promise<RecommendResponse> {
    const response = await fetch(`${API_BASE_URL}/api/recommend/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get available activity types
 */
export async function getActivityTypes(): Promise<{ activities: { value: string, label: string }[] }> {
    const response = await fetch(`${API_BASE_URL}/api/recommend/activity-types`);
    return response.json();
}

/**
 * Get available price ranges
 */
export async function getPriceRanges(): Promise<{ ranges: { value: string, label: string }[] }> {
    const response = await fetch(`${API_BASE_URL}/api/recommend/price-ranges`);
    return response.json();
}

// ============================================
// City Autocomplete
// ============================================

export interface CityAutocompleteResult {
    name: string;
    place_id: string;
    description: string;
    full_description: string;
}

export interface CityAutocompleteResponse {
    query: string;
    count: number;
    cities: CityAutocompleteResult[];
}

/**
 * Autocomplete California cities using Google Places API
 */
export async function autocompleteCities(query: string): Promise<CityAutocompleteResult[]> {
    if (!query || query.length < 1) {
        return [];
    }

    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_BASE_URL}/api/places/autocomplete?${params}`);

    if (!response.ok) {
        console.error('City autocomplete failed:', response.statusText);
        return [];
    }

    const data: CityAutocompleteResponse = await response.json();
    return data.cities;
}
// ============================================
// Authentication & User
// ============================================

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface SearchHistoryItem {
    city: string;
    query?: string | null;
    timestamp: string;
}

/**
 * Helper to get headers with Auth token
 */
function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
}

export async function register(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
}

export async function login(username: string, password: string): Promise<AuthResponse> {
    // OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    return response.json();
}

export async function getHistory(): Promise<SearchHistoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/me/history`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch history');
    }

    return response.json();
}
