'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Clock,
    DollarSign,
    Star,
    Filter,
    Check,
    ArrowRight,
    Sparkles,
    X,
    ChevronDown
} from 'lucide-react';
import { City, Place, ActivityType, PriceRange, TravelPace } from '@/types';

// Mock places data - will be replaced with API call
const mockPlaces: Place[] = [
    {
        id: '1',
        name: "Golden Gate Bridge",
        summary: "Iconic suspension bridge with stunning views of the bay and city skyline",
        rating: 4.8,
        userRatingsTotal: 142350,
        address: "Golden Gate Bridge, San Francisco, CA",
        coordinates: { lat: 37.8199, lng: -122.4783 },
        photoUrl: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600",
        types: ['outdoor', 'photography', 'iconic'],
        priceLevel: 0,
        duration: 60
    },
    {
        id: '2',
        name: "Fisherman's Wharf",
        summary: "Historic waterfront with seafood restaurants, sea lions, and street performers",
        rating: 4.5,
        userRatingsTotal: 98420,
        address: "Fisherman's Wharf, San Francisco, CA",
        coordinates: { lat: 37.8080, lng: -122.4177 },
        photoUrl: "https://images.unsplash.com/photo-1534050359320-02900022671e?w=600",
        types: ['food', 'cultural', 'family'],
        priceLevel: 2,
        duration: 90
    },
    {
        id: '3',
        name: "Alcatraz Island",
        summary: "Former federal prison on an island with guided tours and bay views",
        rating: 4.7,
        userRatingsTotal: 76230,
        address: "Alcatraz Island, San Francisco, CA",
        coordinates: { lat: 37.8267, lng: -122.4230 },
        photoUrl: "https://images.unsplash.com/photo-1564509143949-d8e7b8c6c3e8?w=600",
        types: ['cultural', 'adventure'],
        priceLevel: 2,
        duration: 180
    },
    {
        id: '4',
        name: "Tartine Bakery",
        summary: "Legendary bakery famous for morning buns and country bread",
        rating: 4.6,
        userRatingsTotal: 8420,
        address: "600 Guerrero St, San Francisco, CA",
        coordinates: { lat: 37.7614, lng: -122.4241 },
        photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
        types: ['food', 'relaxation'],
        priceLevel: 2,
        duration: 45
    },
    {
        id: '5',
        name: "Golden Gate Park",
        summary: "Massive urban park with gardens, museums, and bison paddock",
        rating: 4.8,
        userRatingsTotal: 54320,
        address: "Golden Gate Park, San Francisco, CA",
        coordinates: { lat: 37.7694, lng: -122.4862 },
        photoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        types: ['outdoor', 'relaxation', 'family'],
        priceLevel: 0,
        duration: 120
    },
    {
        id: '6',
        name: "Chinatown",
        summary: "Oldest Chinatown in North America with authentic food and shops",
        rating: 4.4,
        userRatingsTotal: 32150,
        address: "Chinatown, San Francisco, CA",
        coordinates: { lat: 37.7941, lng: -122.4078 },
        photoUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600",
        types: ['food', 'cultural', 'shopping'],
        priceLevel: 1,
        duration: 90
    },
    {
        id: '7',
        name: "Twin Peaks",
        summary: "Two prominent hills offering 360-degree views of the entire Bay Area",
        rating: 4.6,
        userRatingsTotal: 28430,
        address: "Twin Peaks, San Francisco, CA",
        coordinates: { lat: 37.7544, lng: -122.4477 },
        photoUrl: "https://images.unsplash.com/photo-1521464302861-ce943915d1c3?w=600",
        types: ['outdoor', 'photography', 'adventure'],
        priceLevel: 0,
        duration: 45
    },
    {
        id: '8',
        name: "SFMOMA",
        summary: "World-class modern art museum with stunning architecture",
        rating: 4.5,
        userRatingsTotal: 18920,
        address: "151 3rd St, San Francisco, CA",
        coordinates: { lat: 37.7857, lng: -122.4011 },
        photoUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600",
        types: ['cultural', 'relaxation'],
        priceLevel: 3,
        duration: 120
    },
];

const activityOptions: { value: ActivityType; label: string; emoji: string }[] = [
    { value: 'outdoor', label: 'Outdoor', emoji: '🌲' },
    { value: 'cultural', label: 'Culture', emoji: '🎭' },
    { value: 'food', label: 'Food', emoji: '🍽️' },
    { value: 'adventure', label: 'Adventure', emoji: '🎢' },
    { value: 'photography', label: 'Photo Spots', emoji: '📸' },
    { value: 'relaxation', label: 'Relaxation', emoji: '🧘' },
    { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { value: 'nightlife', label: 'Nightlife', emoji: '🌙' },
];

const priceOptions: { value: PriceRange; label: string }[] = [
    { value: 'free', label: 'Free' },
    { value: 'budget', label: '$' },
    { value: 'moderate', label: '$$' },
    { value: 'upscale', label: '$$$' },
    { value: 'luxury', label: '$$$$' },
];

export default function DiscoverCityPage() {
    const params = useParams();
    const citySlug = params.city as string;

    const [city, setCity] = useState<City | null>(null);
    const [places, setPlaces] = useState<Place[]>(mockPlaces);
    const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(mockPlaces);
    const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([]);
    const [selectedPrice, setSelectedPrice] = useState<PriceRange | null>(null);
    const [minRating, setMinRating] = useState(0);

    // Load city data
    useEffect(() => {
        fetch('/data/california-cities.json')
            .then(res => res.json())
            .then(data => {
                const foundCity = data.cities.find((c: City) => c.slug === citySlug);
                if (foundCity) setCity(foundCity);
            });
    }, [citySlug]);

    // Apply filters
    useEffect(() => {
        let filtered = [...places];

        if (selectedActivities.length > 0) {
            filtered = filtered.filter(place =>
                place.types.some(type => selectedActivities.includes(type as ActivityType))
            );
        }

        if (selectedPrice !== null) {
            const priceMap: Record<PriceRange, number> = {
                free: 0, budget: 1, moderate: 2, upscale: 3, luxury: 4
            };
            filtered = filtered.filter(place =>
                (place.priceLevel ?? 0) <= priceMap[selectedPrice]
            );
        }

        if (minRating > 0) {
            filtered = filtered.filter(place => (place.rating ?? 0) >= minRating);
        }

        setFilteredPlaces(filtered);
    }, [places, selectedActivities, selectedPrice, minRating]);

    const toggleActivity = (activity: ActivityType) => {
        setSelectedActivities(prev =>
            prev.includes(activity)
                ? prev.filter(a => a !== activity)
                : [...prev, activity]
        );
    };

    const togglePlaceSelection = (place: Place) => {
        setSelectedPlaces(prev =>
            prev.find(p => p.id === place.id)
                ? prev.filter(p => p.id !== place.id)
                : [...prev, place]
        );
    };

    const isSelected = (place: Place) => selectedPlaces.some(p => p.id === place.id);

    const totalDuration = selectedPlaces.reduce((acc, p) => acc + (p.duration ?? 60), 0);

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    if (!city) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Hero */}
            <section className="relative h-[50vh] flex items-end">
                <div className="absolute inset-0">
                    <img
                        src={city.image}
                        alt={city.name}
                        className="w-full h-full object-cover brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-[#FF385C] font-bold text-sm uppercase tracking-widest mb-2 block">
                            {city.region}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
                            {city.name}
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl">
                            {city.description}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showFilters
                                ? 'bg-white text-black border-white'
                                : 'border-white/20 text-white hover:border-white/40'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Quick activity filters */}
                    <div className="flex flex-wrap gap-2">
                        {activityOptions.slice(0, 5).map(activity => (
                            <button
                                key={activity.value}
                                onClick={() => toggleActivity(activity.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedActivities.includes(activity.value)
                                        ? 'bg-[#FF385C] text-white border-[#FF385C]'
                                        : 'border-white/20 text-white hover:border-white/40'
                                    }`}
                            >
                                <span>{activity.emoji}</span>
                                {activity.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Activities */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                            Activities
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {activityOptions.map(activity => (
                                                <button
                                                    key={activity.value}
                                                    onClick={() => toggleActivity(activity.value)}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${selectedActivities.includes(activity.value)
                                                            ? 'bg-[#FF385C] text-white'
                                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                        }`}
                                                >
                                                    <span>{activity.emoji}</span>
                                                    {activity.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                            Budget
                                        </h3>
                                        <div className="flex gap-2">
                                            {priceOptions.map(price => (
                                                <button
                                                    key={price.value}
                                                    onClick={() => setSelectedPrice(
                                                        selectedPrice === price.value ? null : price.value
                                                    )}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${selectedPrice === price.value
                                                            ? 'bg-[#FF385C] text-white'
                                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                        }`}
                                                >
                                                    {price.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                                            Minimum Rating
                                        </h3>
                                        <div className="flex gap-2">
                                            {[0, 4, 4.5].map(rating => (
                                                <button
                                                    key={rating}
                                                    onClick={() => setMinRating(rating)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${minRating === rating
                                                            ? 'bg-[#FF385C] text-white'
                                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                        }`}
                                                >
                                                    {rating === 0 ? 'Any' : <><Star className="w-3 h-3 fill-current" /> {rating}+</>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                {(selectedActivities.length > 0 || selectedPrice || minRating > 0) && (
                                    <button
                                        onClick={() => {
                                            setSelectedActivities([]);
                                            setSelectedPrice(null);
                                            setMinRating(0);
                                        }}
                                        className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {filteredPlaces.length} places to explore
                        </h2>
                        <p className="text-gray-400">
                            Select spots to add to your day trip
                        </p>
                    </div>

                    {selectedPlaces.length > 0 && (
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Selected</div>
                            <div className="text-white font-bold">
                                {selectedPlaces.length} places • {formatDuration(totalDuration)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Places Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlaces.map((place, i) => (
                        <motion.div
                            key={place.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => togglePlaceSelection(place)}
                            className={`group cursor-pointer relative rounded-2xl overflow-hidden transition-all ${isSelected(place)
                                    ? 'ring-2 ring-[#FF385C] ring-offset-2 ring-offset-black'
                                    : ''
                                }`}
                        >
                            {/* Image */}
                            <div className="aspect-[4/3] relative">
                                <img
                                    src={place.photoUrl}
                                    alt={place.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                {/* Selection Check */}
                                <div className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected(place)
                                        ? 'bg-[#FF385C] scale-100'
                                        : 'bg-black/50 scale-0 group-hover:scale-100'
                                    }`}>
                                    <Check className="w-5 h-5 text-white" />
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(place.duration ?? 60)}
                                </div>

                                {/* Price Badge */}
                                {place.priceLevel !== undefined && place.priceLevel > 0 && (
                                    <div className="absolute top-3 left-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs text-white">
                                        {'$'.repeat(place.priceLevel)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 bg-white/5">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-white group-hover:text-[#FF385C] transition-colors">
                                        {place.name}
                                    </h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        {place.rating}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                    {place.summary}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {place.types.slice(0, 3).map(type => (
                                        <span
                                            key={type}
                                            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-gray-300"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPlaces.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-white mb-2">No places match your filters</h3>
                        <p className="text-gray-400 mb-4">Try adjusting your filters to see more options</p>
                        <button
                            onClick={() => {
                                setSelectedActivities([]);
                                setSelectedPrice(null);
                                setMinRating(0);
                            }}
                            className="text-[#FF385C] hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </section>

            {/* Floating Selection Bar */}
            <AnimatePresence>
                {selectedPlaces.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/90 backdrop-blur-xl border-t border-white/10"
                    >
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Selected Place Avatars */}
                                <div className="flex -space-x-3">
                                    {selectedPlaces.slice(0, 5).map((place, i) => (
                                        <div
                                            key={place.id}
                                            className="w-10 h-10 rounded-full border-2 border-black overflow-hidden"
                                            style={{ zIndex: 5 - i }}
                                        >
                                            <img
                                                src={place.photoUrl}
                                                alt={place.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                    {selectedPlaces.length > 5 && (
                                        <div className="w-10 h-10 rounded-full border-2 border-black bg-white/20 flex items-center justify-center text-sm text-white font-bold">
                                            +{selectedPlaces.length - 5}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-white font-bold">
                                        {selectedPlaces.length} place{selectedPlaces.length !== 1 ? 's' : ''} selected
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        ~{formatDuration(totalDuration)} total (excluding travel)
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedPlaces([])}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Clear all
                                </button>
                                <a
                                    href={`/itinerary?city=${citySlug}&places=${selectedPlaces.map(p => p.id).join(',')}`}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#FF385C] hover:bg-[#D90B3E] text-white rounded-full font-bold transition-all group"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Build My Itinerary
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
