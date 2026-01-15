'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';

interface Place {
    id: string;
    name: string;
    address: string;
    photo_url?: string;
}

interface ItineraryMapProps {
    places: Place[];
    cityName: string;
    loading?: boolean;
    startLocation?: string;
    endLocation?: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '1rem',
};

const darkMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
    { featureType: 'road.highway.controlled_access', elementType: 'geometry', stylers: [{ color: '#4e4e4e' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

// California city coordinates
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'san diego': { lat: 32.7157, lng: -117.1611 },
    'sacramento': { lat: 38.5816, lng: -121.4944 },
    'san jose': { lat: 37.3382, lng: -121.8863 },
    'oakland': { lat: 37.8044, lng: -122.2712 },
    'santa monica': { lat: 34.0195, lng: -118.4912 },
    'berkeley': { lat: 37.8716, lng: -122.2727 },
    'palo alto': { lat: 37.4419, lng: -122.1430 },
    'napa': { lat: 38.2975, lng: -122.2869 },
    'monterey': { lat: 36.6002, lng: -121.8947 },
    'carmel': { lat: 36.5552, lng: -121.9233 },
    'santa barbara': { lat: 34.4208, lng: -119.6982 },
    'palm springs': { lat: 33.8303, lng: -116.5453 },
    'lake tahoe': { lat: 39.0968, lng: -120.0324 },
    'fresno': { lat: 36.7378, lng: -119.7871 },
};

const libraries: ("places" | "geometry" | "drawing")[] = ["places"];

export default function ItineraryMap({ places, cityName, loading, startLocation, endLocation }: ItineraryMapProps) {
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [geocodedPlaces, setGeocodedPlaces] = useState<Map<string, google.maps.LatLngLiteral>>(new Map());

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    // Get center from city name
    const center = useMemo(() => {
        const normalizedCity = cityName.toLowerCase();
        for (const [key, coords] of Object.entries(cityCoordinates)) {
            if (normalizedCity.includes(key)) {
                return coords;
            }
        }
        return { lat: 37.7749, lng: -122.4194 };
    }, [cityName]);

    // Geocode each place address to get lat/lng
    const geocodePlaces = useCallback(async () => {
        if (!isLoaded || places.length === 0) return;

        const geocoder = new google.maps.Geocoder();
        const newGeocodedPlaces = new Map<string, google.maps.LatLngLiteral>();

        for (const place of places) {
            try {
                const response = await geocoder.geocode({ address: place.address });
                if (response.results[0]) {
                    newGeocodedPlaces.set(place.id, {
                        lat: response.results[0].geometry.location.lat(),
                        lng: response.results[0].geometry.location.lng(),
                    });
                }
            } catch (error) {
                console.error(`Failed to geocode ${place.address}:`, error);
            }
        }

        setGeocodedPlaces(newGeocodedPlaces);
    }, [isLoaded, places]);

    // Fetch actual driving directions from Google
    const fetchDirections = useCallback(() => {
        if (!isLoaded || places.length < 1) return;

        const directionsService = new google.maps.DirectionsService();

        const origin = startLocation || places[0].address;
        const destination = endLocation || startLocation || places[places.length - 1].address;

        // Build waypoints from all places
        const waypoints = places.map(place => ({
            location: place.address,
            stopover: true,
        }));

        directionsService.route(
            {
                origin,
                destination,
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
                optimizeWaypoints: false, // Keep our optimized order
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);
                } else {
                    console.error('Directions request failed:', status);
                }
            }
        );
    }, [isLoaded, places, startLocation, endLocation]);

    // Geocode places and fetch directions when places change
    useEffect(() => {
        if (isLoaded && places.length > 0) {
            geocodePlaces();
            fetchDirections();
        }
    }, [isLoaded, places, geocodePlaces, fetchDirections]);

    if (loadError) {
        return (
            <div className="w-full h-[500px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Failed to load map</p>
                    <p className="text-gray-500 text-sm mt-1">Check your API key configuration</p>
                </div>
            </div>
        );
    }

    if (!isLoaded || loading) {
        return (
            <div className="w-full h-[500px] bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-[#FF385C] animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={11}
                options={{
                    styles: darkMapStyles,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                }}
            >
                {/* Directions route line */}
                {directions && (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            suppressMarkers: true, // We'll add our own custom markers
                            polylineOptions: {
                                strokeColor: '#FF385C',
                                strokeOpacity: 0.9,
                                strokeWeight: 5,
                            },
                        }}
                    />
                )}

                {/* Custom numbered markers for each stop */}
                {places.map((place, index) => {
                    const position = geocodedPlaces.get(place.id);
                    if (!position) return null;

                    return (
                        <Marker
                            key={place.id}
                            position={position}
                            label={{
                                text: String(index + 1),
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '14px',
                            }}
                            icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 18,
                                fillColor: '#FF385C',
                                fillOpacity: 1,
                                strokeColor: 'white',
                                strokeWeight: 3,
                            }}
                            onClick={() => setSelectedPlace(place)}
                        />
                    );
                })}

                {/* Info window for selected place */}
                {selectedPlace && geocodedPlaces.get(selectedPlace.id) && (
                    <InfoWindow
                        position={geocodedPlaces.get(selectedPlace.id)}
                        onCloseClick={() => setSelectedPlace(null)}
                    >
                        <div className="p-2 max-w-[200px]">
                            {selectedPlace.photo_url && (
                                <img
                                    src={selectedPlace.photo_url}
                                    alt={selectedPlace.name}
                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                />
                            )}
                            <h3 className="font-bold text-gray-900">{selectedPlace.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{selectedPlace.address}</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-white">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#FF385C] flex items-center justify-center text-[10px] font-bold">1</div>
                        <span>{places.length} stops</span>
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-1 bg-[#FF385C] rounded" />
                        <span>Driving route</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
