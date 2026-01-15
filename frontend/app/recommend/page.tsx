'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PreferenceQuiz from '@/components/PreferenceQuiz';
import { UserPreference, RecommendedPlace, getRecommendations } from '@/services/api';
import { Star, Loader2, MapPin, Sparkles, ArrowRight, RotateCcw, Check, Plus } from 'lucide-react';

export default function RecommendPage() {
    const router = useRouter();
    const [step, setStep] = useState<'quiz' | 'loading' | 'results'>('quiz');
    const [recommendations, setRecommendations] = useState<RecommendedPlace[]>([]);
    const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
    const [city] = useState('San Francisco');
    const [error, setError] = useState<string | null>(null);

    const handleQuizComplete = async (preferences: UserPreference) => {
        setStep('loading');
        setError(null);

        try {
            const response = await getRecommendations({
                city: city,
                user_preference: preferences
            });

            setRecommendations(response.recommendations);
            // Auto-select top 5 recommendations
            const top5 = response.recommendations.slice(0, 5).map(p => p.id);
            setSelectedPlaces(new Set(top5));
            setStep('results');
        } catch (err) {
            console.error('Failed to get recommendations:', err);
            setError('Failed to load recommendations. Make sure the backend is running on port 8000.');
            setStep('quiz');
        }
    };

    const togglePlace = useCallback((id: string) => {
        setSelectedPlaces(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleBuildItinerary = useCallback(() => {
        const selected = recommendations
            .filter(p => selectedPlaces.has(p.id))
            .map(p => ({
                id: p.id,
                name: p.name,
                address: p.address || `${p.name}, ${city}, CA`,
                photo_url: p.photo_url,
                rating: p.rating
            }));

        const citySlug = city.toLowerCase().replace(/\s+/g, '-');
        const placesParam = encodeURIComponent(JSON.stringify(selected));
        router.push(`/itinerary/${citySlug}?places=${placesParam}`);
    }, [recommendations, selectedPlaces, city, router]);

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-[#FF385C]/10 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF385C]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
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
                                        <span className="text-[#FF385C]">{city}</span>
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
                                Finding your perfect spots...
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
                                        Curated for you
                                    </span>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                        Your {city} picks
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

                            {/* Selection info */}
                            <div className="flex items-center gap-3 mb-6 text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-[#FF385C]" />
                                    <span><span className="text-white font-semibold">{selectedPlaces.size}</span> places selected</span>
                                </span>
                                <span className="text-gray-600">•</span>
                                <span>Click cards to add/remove from itinerary</span>
                            </div>

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
                                            onClick={() => togglePlace(place.id)}
                                            className={`
                                                group rounded-2xl p-5 flex gap-5 transition-all cursor-pointer relative
                                                ${isSelected
                                                    ? 'bg-[#FF385C]/10 border-2 border-[#FF385C]'
                                                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                                                }
                                            `}
                                        >
                                            {/* Selection indicator */}
                                            <div className={`
                                                absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10
                                                ${isSelected
                                                    ? 'bg-[#FF385C] text-white'
                                                    : 'bg-white/10 border border-white/20 text-transparent group-hover:border-white/40'
                                                }
                                            `}>
                                                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-gray-500 group-hover:text-white" />}
                                            </div>

                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold text-white ml-6">
                                                {i + 1}
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
                                                        <h3 className={`text-xl font-bold transition-colors ${isSelected ? 'text-[#FF385C]' : 'text-white group-hover:text-[#FF385C]'}`}>
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

                                            {/* Arrow */}
                                            <div className="flex items-center">
                                                <ArrowRight className={`w-5 h-5 transition-all ${isSelected ? 'text-[#FF385C] translate-x-1' : 'text-gray-500 group-hover:text-[#FF385C] group-hover:translate-x-1'}`} />
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

                            {/* CTA */}
                            {recommendations.length > 0 && selectedPlaces.size > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-12 text-center"
                                >
                                    <button
                                        onClick={handleBuildItinerary}
                                        className="inline-flex items-center gap-3 bg-[#FF385C] hover:bg-[#D90B3E] text-white px-8 py-4 rounded-full font-bold text-lg transition-all group"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Build Itinerary with {selectedPlaces.size} Places
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <p className="text-gray-500 text-sm mt-3">
                                        We'll optimize your route to save driving time
                                    </p>
                                </motion.div>
                            )}

                            {/* Show message if no places selected */}
                            {recommendations.length > 0 && selectedPlaces.size === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-12 text-center"
                                >
                                    <p className="text-gray-400">
                                        Select at least one place to build your itinerary
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
