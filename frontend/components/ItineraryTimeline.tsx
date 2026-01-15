'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Car, X, Loader2, Home, Flag, ChevronDown } from 'lucide-react';
import { RouteDetailsResponse } from '@/services/api';

interface Place {
    id: string;
    name: string;
    address: string;
    photo_url?: string;
    rating?: number;
}

interface ItineraryTimelineProps {
    places: Place[];
    routeDetails: RouteDetailsResponse | null;
    loading?: boolean;
    onRemovePlace?: (id: string) => void;
    startLocation?: string;
    endLocation?: string;
}

const VISIT_DURATION_OPTIONS = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
];

const DEFAULT_VISIT_DURATION = 45;

// Calculate estimated times based on a 9 AM start
function calculateTimes(
    places: Place[],
    routeDetails: RouteDetailsResponse | null,
    hasStartLocation: boolean,
    visitDurations: Record<string, number>
): string[] {
    const times: string[] = [];
    let currentMinutes = 9 * 60; // Start at 9:00 AM

    // Account for drive from start location to first stop
    if (hasStartLocation && routeDetails?.segments[0]) {
        currentMinutes += Math.round((routeDetails.segments[0].duration_seconds || 0) / 60);
    }

    places.forEach((place, index) => {
        // Round to whole minutes to avoid decimal display issues
        const roundedMinutes = Math.round(currentMinutes);
        const hours = Math.floor(roundedMinutes / 60) % 24;
        const mins = roundedMinutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        times.push(`${displayHours}:${mins.toString().padStart(2, '0')} ${period}`);

        // Add visit time + travel time to next stop
        const visitDuration = visitDurations[place.id] || DEFAULT_VISIT_DURATION;
        const segmentIndex = hasStartLocation ? index + 1 : index;
        const travelSeconds = routeDetails?.segments[segmentIndex]?.duration_seconds || 900;
        currentMinutes += visitDuration + Math.round(travelSeconds / 60);
    });

    return times;
}

export default function ItineraryTimeline({
    places,
    routeDetails,
    loading,
    onRemovePlace,
    startLocation,
    endLocation
}: ItineraryTimelineProps) {
    const hasStartLocation = Boolean(startLocation);
    const isRoundTrip = startLocation === endLocation;

    // Track custom visit durations per place
    const [visitDurations, setVisitDurations] = useState<Record<string, number>>({});
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const estimatedTimes = useMemo(() =>
        calculateTimes(places, routeDetails, hasStartLocation, visitDurations),
        [places, routeDetails, hasStartLocation, visitDurations]
    );

    const handleDurationChange = (placeId: string, duration: number) => {
        setVisitDurations(prev => ({ ...prev, [placeId]: duration }));
        setOpenDropdown(null);
    };

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center justify-center gap-3 text-gray-400 py-12">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Building your timeline...</span>
                </div>
            </div>
        );
    }

    if (places.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No places selected</h3>
                <p className="text-gray-400">Go back and select some places to add to your itinerary</p>
            </div>
        );
    }

    // Get travel time from start to first stop
    const startToFirstSegment = routeDetails?.segments[0];

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FF385C]" />
                Your Timeline
            </h2>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-8 w-0.5 bg-gradient-to-b from-green-500 via-[#FF385C] to-green-500" />

                {/* Start Location */}
                {startLocation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative flex items-center gap-4 mb-2"
                    >
                        <div className="relative z-10 flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                                <Home className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">
                                Start • 9:00 AM
                            </div>
                            <div className="text-white font-medium">{startLocation}</div>
                        </div>
                    </motion.div>
                )}

                {/* Travel from start to first stop */}
                {startToFirstSegment && startLocation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative flex items-center gap-4 py-3"
                    >
                        <div className="w-12 flex justify-center">
                            <Car className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{startToFirstSegment.duration_text}</span>
                            <span className="text-gray-600">•</span>
                            <span>{startToFirstSegment.distance_text}</span>
                        </div>
                    </motion.div>
                )}

                {/* Stops */}
                <div className="space-y-1">
                    {places.map((place, index) => {
                        // Segment from this stop to next stop
                        const segmentToNext = routeDetails?.segments[index + 1];
                        const currentDuration = visitDurations[place.id] || DEFAULT_VISIT_DURATION;
                        const isDropdownOpen = openDropdown === place.id;

                        return (
                            <div key={place.id}>
                                {/* Place card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative flex items-start gap-4 group"
                                >
                                    {/* Timeline node */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-[#FF385C] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#FF385C]/30">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                {/* Time and Duration */}
                                                <div className="flex items-center gap-2 text-sm mb-1 flex-wrap">
                                                    <span className="flex items-center gap-1 text-[#FF385C] font-medium">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {estimatedTimes[index]}
                                                    </span>
                                                    <span className="text-gray-500">•</span>

                                                    {/* Duration Dropdown */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setOpenDropdown(isDropdownOpen ? null : place.id)}
                                                            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md"
                                                        >
                                                            {VISIT_DURATION_OPTIONS.find(o => o.value === currentDuration)?.label || `${currentDuration} min`}
                                                            <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                                        </button>

                                                        {isDropdownOpen && (
                                                            <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 min-w-[100px] py-1">
                                                                {VISIT_DURATION_OPTIONS.map(option => (
                                                                    <button
                                                                        key={option.value}
                                                                        onClick={() => handleDurationChange(place.id, option.value)}
                                                                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 transition-colors ${currentDuration === option.value ? 'text-[#FF385C]' : 'text-gray-300'
                                                                            }`}
                                                                    >
                                                                        {option.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Name */}
                                                <h3 className="text-lg font-semibold text-white truncate">
                                                    {place.name}
                                                </h3>

                                                {/* Address */}
                                                <p className="text-sm text-gray-400 truncate mt-1">
                                                    {place.address}
                                                </p>
                                            </div>

                                            {/* Photo */}
                                            {place.photo_url && (
                                                <img
                                                    src={place.photo_url}
                                                    alt={place.name}
                                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                />
                                            )}

                                            {/* Remove button */}
                                            {onRemovePlace && (
                                                <button
                                                    onClick={() => onRemovePlace(place.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                                >
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Travel time to next stop */}
                                {index < places.length - 1 && segmentToNext && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.1 + 0.05 }}
                                        className="relative flex items-center gap-4 py-3"
                                    >
                                        <div className="w-12 flex justify-center">
                                            <Car className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{segmentToNext.duration_text}</span>
                                            <span className="text-gray-600">•</span>
                                            <span>{segmentToNext.distance_text}</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Travel time to end (after last stop) */}
                                {index === places.length - 1 && routeDetails?.segments[places.length + 1] && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="relative flex items-center gap-4 py-3"
                                    >
                                        <div className="w-12 flex justify-center">
                                            <Car className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{routeDetails.segments[places.length + 1]?.duration_text || 'N/A'}</span>
                                            <span className="text-gray-600">•</span>
                                            <span>{routeDetails.segments[places.length + 1]?.distance_text || 'N/A'}</span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-gray-400">to {isRoundTrip ? 'start' : 'end'}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* End marker */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: places.length * 0.1 }}
                    className="relative flex items-center gap-4 mt-2"
                >
                    <div className="relative z-10 flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                            {isRoundTrip ? <Home className="w-5 h-5" /> : <Flag className="w-5 h-5" />}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">
                            {isRoundTrip ? 'Return Home' : 'End'}
                        </div>
                        <div className="text-white font-medium">
                            {endLocation || startLocation || 'Trip complete'}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
