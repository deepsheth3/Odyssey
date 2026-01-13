'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PreferenceQuiz from '@/components/PreferenceQuiz';
import { UserPreference, RecommendedPlace, getRecommendations } from '@/services/api';
import { Star, MapPin, Sparkles, ArrowRight, RotateCcw, Check, Calendar } from 'lucide-react';
import { City } from '@/types';

export default function RecommendCityPage() {
    const params = useParams();
    const router = useRouter();
    const citySlug = params.city as string;

    const [step, setStep] = useState<'quiz' | 'loading' | 'results'>('quiz');
    const [recommendations, setRecommendations] = useState<RecommendedPlace[]>([]);
    const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
    const [city, setCity] = useState<City | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Derive city name from slug (for cities not in static JSON)
    const derivedCityName = citySlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    // Load city data - try static JSON first, but work without it
    useEffect(() => {
        fetch('/data/california-cities.json')
            .then(res => res.json())
            .then(data => {
                const foundCity = data.cities.find((c: City) => c.slug === citySlug);
                if (foundCity) {
                    setCity(foundCity);
                } else {
                    // City not in static JSON - create a minimal city object
                    setCity({
                        name: derivedCityName,
                        slug: citySlug,
                        region: 'California',
                        coordinates: { lat: 0, lng: 0 },
                        description: '',
                        image: '',
                        tags: []
                    });
                }
            })
            .catch(() => {
                // If JSON load fails, still work with derived name
                setCity({
                    name: derivedCityName,
                    slug: citySlug,
                    region: 'California',
                    coordinates: { lat: 0, lng: 0 },
                    description: '',
                    image: '',
                    tags: []
                });
            });
    }, [citySlug, derivedCityName]);

    const handleQuizComplete = async (preferences: UserPreference) => {
        // Use derived city name if city object not loaded yet
        const cityName = city?.name || derivedCityName;

        setStep('loading');
        setError(null);

        try {
            const response = await getRecommendations({
                city: `${cityName}, CA`,
                user_preference: preferences
            });

            setRecommendations(response.recommendations);
            setSelectedPlaces(new Set()); // Reset selections
            setStep('results');
        } catch (err) {
            console.error('Failed to get recommendations:', err);
            setError('Failed to load recommendations. Make sure the backend is running on port 8000.');
            setStep('quiz');
        }
    };

    const toggleSelection = (placeId: string) => {
        setSelectedPlaces(prev => {
            const newSet = new Set(prev);
            if (newSet.has(placeId)) {
                newSet.delete(placeId);
            } else {
                newSet.add(placeId);
            }
            return newSet;
        });
    };

    const handleBuildItinerary = () => {
        // Get selected places data and navigate to itinerary page
        const selectedData = recommendations.filter(p => selectedPlaces.has(p.id));
        const placeIds = selectedData.map(p => p.id).join(',');
        router.push(`/itinerary/${citySlug}?places=${placeIds}`);
    };

    // Format city name for display
    const cityName = city?.name || citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {city?.image && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url(${city.image})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF385C]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-32">
                <AnimatePresence mode="wait">
                    {/* Quiz Step */}
                    {step === 'quiz' && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="text-center mb-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <span className="inline-flex items-center gap-2 text-[#FF385C] font-bold text-sm uppercase tracking-widest mb-4">
                                        <Sparkles className="w-4 h-4" />
                                        Personalized Recommendations
                                    </span>
                                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
                                        Plan your perfect day in
                                        <br />
                                        <span className="text-[#FF385C]">{cityName}</span>
                                    </h1>
                                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                        Tell us what you're looking for and we'll curate the best spots just for you
                                    </p>
                                </motion.div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl mb-8 text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <PreferenceQuiz onComplete={handleQuizComplete} />
                        </motion.div>
                    )}

                    {/* Loading Step */}
                    {step === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-[60vh] flex flex-col items-center justify-center"
                        >
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-white/10 rounded-full" />
                                <div className="absolute inset-0 w-20 h-20 border-4 border-[#FF385C] border-t-transparent rounded-full animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mt-8 mb-2">
                                Finding your perfect spots in {cityName}...
                            </h2>
                            <p className="text-gray-400">
                                Analyzing your preferences and curating recommendations
                            </p>
                        </motion.div>
                    )}

                    {/* Results Step */}
                    {step === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <span className="inline-flex items-center gap-2 text-[#FF385C] font-bold text-sm uppercase tracking-widest mb-2">
                                        <Sparkles className="w-4 h-4" />
                                        Select your stops
                                    </span>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                        Your {cityName} picks
                                    </h1>
                                </div>
                                <button
                                    onClick={() => {
                                        setStep('quiz');
                                        setRecommendations([]);
                                        setSelectedPlaces(new Set());
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Retake Quiz
                                </button>
                            </div>

                            {/* Selection hint */}
                            <p className="text-gray-400 mb-8">
                                Click on places to add them to your itinerary. Select at least 2 places to continue.
                            </p>

                            {/* Results Grid */}
                            <div className="grid gap-4">
                                {recommendations.map((place, i) => {
                                    const isSelected = selectedPlaces.has(place.id);
                                    return (
                                        <motion.div
                                            key={place.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            onClick={() => toggleSelection(place.id)}
                                            className={`
                                                group rounded-2xl p-5 flex gap-5 transition-all cursor-pointer
                                                ${isSelected
                                                    ? 'bg-[#FF385C]/20 border-2 border-[#FF385C]'
                                                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                                                }
                                            `}
                                        >
                                            {/* Selection Checkbox */}
                                            <div className={`
                                                flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all
                                                ${isSelected
                                                    ? 'bg-[#FF385C] text-white'
                                                    : 'bg-white/10 text-white/50'
                                                }
                                            `}>
                                                {isSelected ? (
                                                    <Check className="w-6 h-6" />
                                                ) : (
                                                    <span className="text-xl font-bold">{i + 1}</span>
                                                )}
                                            </div>

                                            {/* Image */}
                                            {place.photo_url ? (
                                                <img
                                                    src={place.photo_url}
                                                    alt={place.name}
                                                    className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-28 h-28 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-8 h-8 text-gray-500" />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div>
                                                        <h3 className={`text-xl font-bold transition-colors ${isSelected ? 'text-[#FF385C]' : 'text-white group-hover:text-[#FF385C]'
                                                            }`}>
                                                            {place.name}
                                                        </h3>
                                                        {place.address && (
                                                            <p className="text-sm text-gray-400 truncate mt-1">
                                                                {place.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {place.rating && (
                                                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full flex-shrink-0">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-semibold text-white">{place.rating}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Match Reasons */}
                                                {place.reasons.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {place.reasons.map((reason, j) => (
                                                            <span
                                                                key={j}
                                                                className="text-xs font-medium bg-[#FF385C]/20 text-[#FF385C] px-3 py-1 rounded-full"
                                                            >
                                                                {reason}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {recommendations.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-xl font-bold text-white mb-2">No recommendations found</h3>
                                    <p className="text-gray-400">Try different preferences</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Selection Bar */}
            {step === 'results' && selectedPlaces.size > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 p-4 z-50"
                >
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#FF385C] w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg">
                                {selectedPlaces.size}
                            </div>
                            <div>
                                <p className="text-white font-semibold">
                                    {selectedPlaces.size} {selectedPlaces.size === 1 ? 'place' : 'places'} selected
                                </p>
                                <p className="text-gray-400 text-sm">
                                    {selectedPlaces.size < 2 ? 'Select at least 2 places' : 'Ready to build your itinerary'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleBuildItinerary}
                            disabled={selectedPlaces.size < 2}
                            className={`
                                flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all
                                ${selectedPlaces.size >= 2
                                    ? 'bg-[#FF385C] hover:bg-[#D90B3E] text-white'
                                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                                }
                            `}
                        >
                            <Calendar className="w-5 h-5" />
                            Build Itinerary
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
