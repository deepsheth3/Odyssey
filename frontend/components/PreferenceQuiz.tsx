'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mountain, Palette, Utensils, Music, ShoppingBag,
    Sparkles, Camera, Compass, ArrowRight, ArrowLeft
} from 'lucide-react';
import { ActivityType, PriceRange, TravelPace, UserPreference } from '@/services/api';

interface PreferenceQuizProps {
    onComplete: (preferences: UserPreference) => void;
    onSkip?: () => void;
}

const ACTIVITIES = [
    { value: 'outdoor' as ActivityType, label: 'Outdoor', icon: Mountain },
    { value: 'cultural' as ActivityType, label: 'Culture', icon: Palette },
    { value: 'food' as ActivityType, label: 'Food', icon: Utensils },
    { value: 'nightlife' as ActivityType, label: 'Nightlife', icon: Music },
    { value: 'shopping' as ActivityType, label: 'Shopping', icon: ShoppingBag },
    { value: 'relaxation' as ActivityType, label: 'Relaxation', icon: Sparkles },
    { value: 'photography' as ActivityType, label: 'Photography', icon: Camera },
    { value: 'adventure' as ActivityType, label: 'Adventure', icon: Compass },
];

const PRICE_RANGES = [
    { value: 'free' as PriceRange, label: 'Free', desc: 'No cost' },
    { value: 'budget' as PriceRange, label: '$', desc: 'Budget friendly' },
    { value: 'moderate' as PriceRange, label: '$$', desc: 'Mid-range' },
    { value: 'upscale' as PriceRange, label: '$$$', desc: 'Upscale' },
    { value: 'luxury' as PriceRange, label: '$$$$', desc: 'Luxury' },
];

const TRAVEL_PACES = [
    { value: 'relaxed' as TravelPace, label: 'Relaxed', desc: '3-4 stops' },
    { value: 'moderate' as TravelPace, label: 'Balanced', desc: '5-6 stops' },
    { value: 'packed' as TravelPace, label: 'Action-Packed', desc: '7+ stops' },
];

export default function PreferenceQuiz({ onComplete, onSkip }: PreferenceQuizProps) {
    const [step, setStep] = useState(0);
    const [preferences, setPreferences] = useState<UserPreference>({
        activities: [],
        price_range: 'moderate',
        travel_pace: 'moderate',
        start_time: '09:00',
        end_time: '21:00',
        accessibility_needs: false,
        has_car: true,
    });

    const toggleActivity = (activity: ActivityType) => {
        setPreferences(prev => ({
            ...prev,
            activities: prev.activities.includes(activity)
                ? prev.activities.filter(a => a !== activity)
                : [...prev.activities, activity]
        }));
    };

    const nextStep = () => {
        if (step < 2) {
            setStep(prev => prev + 1);
        } else {
            onComplete(preferences);
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(prev => prev - 1);
    };

    const stepTitles = [
        "What's your vibe?",
        "What's your budget?",
        "How packed should your day be?"
    ];

    return (
        <div className="w-full">
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-12">
                {[0, 1, 2].map(i => (
                    <div key={i} className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step
                                    ? 'bg-[#FF385C] text-white'
                                    : i === step
                                        ? 'bg-white text-black'
                                        : 'bg-white/10 text-white/40'
                                }`}
                        >
                            {i + 1}
                        </div>
                        {i < 2 && (
                            <div className={`w-16 h-0.5 mx-2 transition-colors ${i < step ? 'bg-[#FF385C]' : 'bg-white/10'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Activities */}
                {step === 0 && (
                    <motion.div
                        key="step-0"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                            {stepTitles[0]}
                        </h2>
                        <p className="text-gray-400 text-lg mb-10">
                            Select all that interest you
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {ACTIVITIES.map(activity => {
                                const Icon = activity.icon;
                                const isSelected = preferences.activities.includes(activity.value);
                                return (
                                    <button
                                        key={activity.value}
                                        onClick={() => toggleActivity(activity.value)}
                                        className={`
                                            group relative p-6 rounded-2xl border transition-all duration-300
                                            ${isSelected
                                                ? 'bg-[#FF385C] border-[#FF385C] text-white'
                                                : 'bg-white/5 border-white/10 text-white hover:border-white/30 hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-8 h-8 mb-3 transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-gray-400'
                                            }`} />
                                        <span className="font-semibold">{activity.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Budget */}
                {step === 1 && (
                    <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                            {stepTitles[1]}
                        </h2>
                        <p className="text-gray-400 text-lg mb-10">
                            We'll tailor recommendations to your spending comfort
                        </p>

                        <div className="flex gap-3">
                            {PRICE_RANGES.map(range => (
                                <button
                                    key={range.value}
                                    onClick={() => setPreferences(prev => ({ ...prev, price_range: range.value }))}
                                    className={`
                                        flex-1 py-6 rounded-2xl border transition-all duration-300 flex flex-col items-center
                                        ${preferences.price_range === range.value
                                            ? 'bg-[#FF385C] border-[#FF385C] text-white'
                                            : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                                        }
                                    `}
                                >
                                    <span className="text-2xl font-bold mb-1">{range.label}</span>
                                    <span className="text-sm opacity-60">{range.desc}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Pace */}
                {step === 2 && (
                    <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                            {stepTitles[2]}
                        </h2>
                        <p className="text-gray-400 text-lg mb-10">
                            We'll optimize your route accordingly
                        </p>

                        <div className="grid grid-cols-3 gap-4">
                            {TRAVEL_PACES.map(pace => (
                                <button
                                    key={pace.value}
                                    onClick={() => setPreferences(prev => ({ ...prev, travel_pace: pace.value }))}
                                    className={`
                                        py-8 rounded-2xl border transition-all duration-300 flex flex-col items-center
                                        ${preferences.travel_pace === pace.value
                                            ? 'bg-[#FF385C] border-[#FF385C] text-white'
                                            : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                                        }
                                    `}
                                >
                                    <span className="text-xl font-bold mb-1">{pace.label}</span>
                                    <span className="text-sm opacity-60">{pace.desc}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <button
                    onClick={prevStep}
                    disabled={step === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${step === 0
                            ? 'text-white/20 cursor-not-allowed'
                            : 'text-white hover:bg-white/10'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="flex gap-4">
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                        >
                            Skip
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        disabled={step === 0 && preferences.activities.length === 0}
                        className={`
                            flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all
                            ${step === 0 && preferences.activities.length === 0
                                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gray-200'
                            }
                        `}
                    >
                        {step === 2 ? 'Get Recommendations' : 'Continue'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
