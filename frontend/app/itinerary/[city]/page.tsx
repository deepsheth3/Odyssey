'use client';

import { useEffect, useState, useMemo, useCallback, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Loader2, CheckCircle2, Car, Sparkles, Share2, RotateCcw,
    MapPin, Navigation, RotateCw
} from 'lucide-react';
import { optimizeRoute, getRouteDetails, OptimizeRouteResponse, RouteDetailsResponse } from '@/services/api';
import ItineraryMap from '@/components/ItineraryMap';
import ItineraryTimeline from '@/components/ItineraryTimeline';

interface ItineraryPlace {
    id: string;
    name: string;
    address: string;
    photo_url?: string;
    rating?: number;
}

interface PageProps {
    params: Promise<{ city: string }>;
}

export default function ItineraryPage({ params }: PageProps) {
    // Unwrap params Promise with React.use() for Next.js 16
    const { city } = use(params);
    const searchParams = useSearchParams();
    const cityName = decodeURIComponent(city).replace(/-/g, ' ');

    // Parse places from URL or use demo data
    const [places, setPlaces] = useState<ItineraryPlace[]>([]);
    const [optimizedOrder, setOptimizedOrder] = useState<string[]>([]);
    const [routeDetails, setRouteDetails] = useState<RouteDetailsResponse | null>(null);
    const [optimizeResult, setOptimizeResult] = useState<OptimizeRouteResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Start/End location state - initialized from URL params
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [roundTrip, setRoundTrip] = useState(true);
    const [showLocationInputs, setShowLocationInputs] = useState(false);

    // Parse params on mount
    useEffect(() => {
        // Read start location from URL
        const startParam = searchParams.get('start');
        if (startParam) {
            setStartLocation(decodeURIComponent(startParam));
        } else {
            setStartLocation(`${cityName}, California`);
        }

        // Read round trip from URL
        const rtParam = searchParams.get('roundTrip');
        setRoundTrip(rtParam !== '0');

        // Parse places from URL
        const placesParam = searchParams.get('places');
        if (placesParam) {
            try {
                const decoded = decodeURIComponent(placesParam);
                const parsed = JSON.parse(decoded);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setPlaces(parsed);
                    return;
                }
            } catch (e) {
                console.error('Failed to parse places:', e);
            }
        }
        // Fallback to demo places
        setPlaces(getDemoPlaces(cityName));
    }, [searchParams, cityName]);

    // Optimize route when places or locations change
    useEffect(() => {
        if (places.length < 2) {
            setLoading(false);
            return;
        }

        async function optimizeItinerary() {
            setLoading(true);
            setError(null);

            try {
                const addresses = places.map(p => p.address);
                const effectiveEnd = roundTrip ? startLocation : (endLocation || startLocation);

                // Optimize the route
                const result = await optimizeRoute({
                    start: startLocation,
                    stops: addresses,
                    end: effectiveEnd
                });

                setOptimizeResult(result);
                setOptimizedOrder(result.optimized_order);

                // Get detailed route info
                const details = await getRouteDetails(result.optimized_order);
                setRouteDetails(details);

            } catch (err) {
                console.error('Failed to optimize route:', err);
                setError('Could not optimize route. Using original order.');
                setOptimizedOrder(places.map(p => p.address));
            } finally {
                setLoading(false);
            }
        }

        optimizeItinerary();
    }, [places, startLocation, endLocation, roundTrip]);

    // Reorder places based on optimized order
    const orderedPlaces = useMemo(() => {
        if (optimizedOrder.length === 0) return places;

        const effectiveEnd = roundTrip ? startLocation : (endLocation || startLocation);
        return optimizedOrder
            .filter(addr => addr !== startLocation && addr !== effectiveEnd)
            .map(addr => places.find(p => p.address === addr))
            .filter(Boolean) as ItineraryPlace[];
    }, [places, optimizedOrder, startLocation, endLocation, roundTrip]);

    const handleRemovePlace = useCallback((id: string) => {
        setPlaces(prev => prev.filter(p => p.id !== id));
    }, []);

    const handleReoptimize = useCallback(() => {
        // Trigger re-optimization by toggling a dependency
        setPlaces(prev => [...prev]);
    }, []);

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF385C]/10 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF385C]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6">
                    <div>
                        <span className="inline-flex items-center gap-2 text-[#FF385C] font-bold text-sm uppercase tracking-widest mb-2">
                            <Sparkles className="w-4 h-4" />
                            Your Itinerary
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight capitalize">
                            Day Trip to {cityName}
                        </h1>
                        <p className="text-gray-400 mt-3 text-lg">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Optimizing your route...
                                </span>
                            ) : routeDetails ? (
                                <span className="flex items-center gap-3 flex-wrap">
                                    <span className="flex items-center gap-1">
                                        <Car className="w-4 h-4" />
                                        {routeDetails.total_duration_formatted} total drive
                                    </span>
                                    <span className="text-gray-600">•</span>
                                    <span>{routeDetails.total_distance_formatted}</span>
                                    <span className="text-gray-600">•</span>
                                    <span>{orderedPlaces.length} stops</span>
                                    {roundTrip && <span className="text-gray-600">•</span>}
                                    {roundTrip && <span className="flex items-center gap-1"><RotateCw className="w-3 h-3" /> Round trip</span>}
                                </span>
                            ) : (
                                <span>{places.length} places selected</span>
                            )}
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6 md:mt-0">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Edit Places
                        </button>
                    </div>
                </div>

                {/* Start/End Location Settings */}
                <motion.div
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => setShowLocationInputs(!showLocationInputs)}
                        className="w-full flex items-center justify-between text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF385C]/20 flex items-center justify-center">
                                <Navigation className="w-5 h-5 text-[#FF385C]" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Trip Start & End</h3>
                                <p className="text-gray-400 text-sm">
                                    {roundTrip ? `Round trip from ${startLocation}` : `${startLocation} → ${endLocation || startLocation}`}
                                </p>
                            </div>
                        </div>
                        <span className="text-gray-400 text-sm">{showLocationInputs ? 'Hide' : 'Edit'}</span>
                    </button>

                    {showLocationInputs && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-5 pt-5 border-t border-white/10 space-y-4"
                        >
                            {/* Start Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Starting Point
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    <input
                                        type="text"
                                        value={startLocation}
                                        onChange={(e) => setStartLocation(e.target.value)}
                                        placeholder="Enter starting address..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF385C]/50"
                                    />
                                </div>
                            </div>

                            {/* Round Trip Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <RotateCw className="w-5 h-5 text-gray-400" />
                                    <span className="text-white">Return to starting point (round trip)</span>
                                </div>
                                <button
                                    onClick={() => setRoundTrip(!roundTrip)}
                                    className={`w-12 h-7 rounded-full transition-colors ${roundTrip ? 'bg-[#FF385C]' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${roundTrip ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* End Location (only if not round trip) */}
                            {!roundTrip && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        End Point
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                                        <input
                                            type="text"
                                            value={endLocation}
                                            onChange={(e) => setEndLocation(e.target.value)}
                                            placeholder="Enter ending address..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF385C]/50"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Re-optimize button */}
                            <button
                                onClick={handleReoptimize}
                                className="w-full bg-[#FF385C] hover:bg-[#D90B3E] text-white py-3 rounded-xl font-semibold transition-colors"
                            >
                                Re-optimize Route
                            </button>
                        </motion.div>
                    )}
                </motion.div>

                {/* Time Saved Badge */}
                {optimizeResult && optimizeResult.time_saved_seconds > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-full mb-8"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-semibold">
                            Route optimized! Saving {optimizeResult.time_saved_formatted}
                        </span>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-xl mb-8"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Main Content - Map + Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="order-2 lg:order-1"
                    >
                        <div className="sticky top-24">
                            <ItineraryMap
                                places={orderedPlaces}
                                cityName={cityName}
                                loading={loading}
                                startLocation={startLocation}
                                endLocation={roundTrip ? startLocation : endLocation}
                            />
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="order-1 lg:order-2"
                    >
                        <ItineraryTimeline
                            places={orderedPlaces}
                            routeDetails={routeDetails}
                            loading={loading}
                            onRemovePlace={handleRemovePlace}
                            startLocation={startLocation}
                            endLocation={roundTrip ? startLocation : endLocation}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Demo places for testing
function getDemoPlaces(city: string): ItineraryPlace[] {
    const cityLower = city.toLowerCase();

    if (cityLower.includes('san francisco')) {
        return [
            { id: '1', name: 'Golden Gate Bridge', address: 'Golden Gate Bridge, San Francisco, CA' },
            { id: '2', name: 'Fisherman\'s Wharf', address: 'Fisherman\'s Wharf, San Francisco, CA' },
            { id: '3', name: 'Alcatraz Island', address: 'Alcatraz Island, San Francisco, CA' },
            { id: '4', name: 'Chinatown', address: 'Chinatown, San Francisco, CA' },
            { id: '5', name: 'Golden Gate Park', address: 'Golden Gate Park, San Francisco, CA' },
        ];
    }

    if (cityLower.includes('los angeles')) {
        return [
            { id: '1', name: 'Hollywood Sign', address: 'Hollywood Sign, Los Angeles, CA' },
            { id: '2', name: 'Santa Monica Pier', address: 'Santa Monica Pier, Santa Monica, CA' },
            { id: '3', name: 'Griffith Observatory', address: 'Griffith Observatory, Los Angeles, CA' },
            { id: '4', name: 'The Getty Center', address: 'The Getty Center, Los Angeles, CA' },
        ];
    }

    // Default demo places
    return [
        { id: '1', name: 'Downtown', address: `Downtown ${city}, CA` },
        { id: '2', name: 'City Park', address: `Main City Park, ${city}, CA` },
        { id: '3', name: 'Historic District', address: `Historic District, ${city}, CA` },
    ];
}
