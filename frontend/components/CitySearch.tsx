'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, TrendingUp, Loader2 } from 'lucide-react';
import { City, CitiesData } from '@/types';
import { createPortal } from 'react-dom';
import { autocompleteCities, CityAutocompleteResult } from '@/services/api';

interface CitySearchProps {
    onSelect?: (city: City) => void;
    placeholder?: string;
    autoFocus?: boolean;
    variant?: 'hero' | 'compact';
}

interface DropdownPosition {
    top: number;
    left: number;
    width: number;
}

// Featured cities to show when no query (trending)
const FEATURED_CITIES: City[] = [
    {
        name: "San Francisco",
        slug: "san-francisco",
        region: "Bay Area",
        coordinates: { lat: 37.7749, lng: -122.4194 },
        description: "The City by the Bay - iconic bridges, steep hills, world-class food",
        image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
        tags: ["urban", "food", "culture", "iconic"]
    },
    {
        name: "Los Angeles",
        slug: "los-angeles",
        region: "Southern California",
        coordinates: { lat: 34.0522, lng: -118.2437 },
        description: "Entertainment capital with beaches, mountains, and endless sunshine",
        image: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800",
        tags: ["urban", "beaches", "entertainment", "diverse"]
    },
    {
        name: "San Diego",
        slug: "san-diego",
        region: "Southern California",
        coordinates: { lat: 32.7157, lng: -117.1611 },
        description: "Perfect weather, stunning coastline, laid-back vibes",
        image: "https://images.unsplash.com/photo-1538689621163-f5be0ad11c46?w=800",
        tags: ["beaches", "relaxation", "outdoor", "family"]
    },
    {
        name: "Napa Valley",
        slug: "napa-valley",
        region: "Wine Country",
        coordinates: { lat: 38.2975, lng: -122.2869 },
        description: "World-renowned wine region with gourmet dining",
        image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800",
        tags: ["wine", "food", "romantic", "luxury"]
    },
    {
        name: "Lake Tahoe",
        slug: "lake-tahoe",
        region: "Sierra Nevada",
        coordinates: { lat: 39.0968, lng: -120.0324 },
        description: "Crystal-clear alpine lake with skiing and hiking",
        image: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800",
        tags: ["outdoor", "adventure", "skiing", "nature"]
    },
    {
        name: "Palm Springs",
        slug: "palm-springs",
        region: "Desert",
        coordinates: { lat: 33.8303, lng: -116.5453 },
        description: "Mid-century modern paradise with desert beauty",
        image: "https://images.unsplash.com/photo-1545153996-e01b50c6ecfa?w=800",
        tags: ["desert", "relaxation", "architecture", "wellness"]
    }
];

// Convert autocomplete result to City format
function autocompleteToCity(result: CityAutocompleteResult): City {
    const slug = result.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return {
        name: result.name,
        slug: slug,
        region: result.description,
        coordinates: { lat: 0, lng: 0 }, // Will be resolved when selected
        description: result.full_description,
        image: "", // No image for dynamic results
        tags: []
    };
}

export default function CitySearch({
    onSelect,
    placeholder = "Where in California?",
    autoFocus = false,
    variant = 'hero'
}: CitySearchProps) {
    const [query, setQuery] = useState('');
    const [filteredCities, setFilteredCities] = useState<City[]>(FEATURED_CITIES);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });
    const [mounted, setMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    // Track mounted state for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update dropdown position based on container position and close when out of view
    useEffect(() => {
        const updatePosition = () => {
            if (containerRef.current && isOpen) {
                const rect = containerRef.current.getBoundingClientRect();

                // Close dropdown if search box is almost out of view (80% hidden)
                const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
                const isAlmostHidden = visibleHeight < rect.height * 0.2;

                if (isAlmostHidden) {
                    setIsOpen(false);
                    return;
                }

                setDropdownPosition({
                    top: rect.bottom + 8, // 8px gap
                    left: rect.left,
                    width: rect.width
                });
            }
        };

        updatePosition();

        // Update on scroll and resize
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Debounced search using Google Places Autocomplete API
    useEffect(() => {
        // Clear any pending debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.length === 0) {
            // Show featured cities when no query
            setFilteredCities(FEATURED_CITIES);
            setIsLoading(false);
            setHighlightedIndex(0);
            return;
        }

        // First check if query matches any featured city (instant feedback)
        const matchedFeatured = FEATURED_CITIES.filter(city =>
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.region.toLowerCase().includes(query.toLowerCase())
        );

        if (matchedFeatured.length > 0) {
            setFilteredCities(matchedFeatured);
        }

        // Debounce API call
        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await autocompleteCities(query);
                if (results.length > 0) {
                    // Merge featured matches with API results, avoiding duplicates
                    const featuredNames = new Set(matchedFeatured.map(c => c.name.toLowerCase()));
                    const apiCities = results
                        .filter(r => !featuredNames.has(r.name.toLowerCase()))
                        .map(autocompleteToCity);

                    setFilteredCities([...matchedFeatured, ...apiCities].slice(0, 10));
                } else if (matchedFeatured.length === 0) {
                    setFilteredCities([]);
                }
            } catch (error) {
                console.error('Autocomplete error:', error);
                // Keep featured matches on error
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    // Handle click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = useCallback((city: City) => {
        setQuery(city.name);
        setIsOpen(false);
        if (onSelect) {
            onSelect(city);
        } else {
            // Navigate to recommendations page for selected city
            router.push(`/recommend/${city.slug}`);
        }
    }, [onSelect, router]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredCities.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCities[highlightedIndex]) {
                    handleSelect(filteredCities[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    const isHero = variant === 'hero';

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Search Input */}
            <div
                className={`
          relative flex items-center
          ${isHero
                        ? 'bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 ring-1 ring-white/20'
                        : 'bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg'
                    }
          transition-all duration-300
          ${isOpen ? (isHero ? 'ring-2 ring-white/40' : 'ring-2 ring-[#FF385C]/50') : ''}
        `}
            >
                <MapPin className={`w-5 h-5 mr-3 ${isHero ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className="flex-1">
                    {isHero && (
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Destination
                        </label>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        className={`
              w-full bg-transparent outline-none
              ${isHero
                                ? 'text-white placeholder-gray-400 text-lg font-medium'
                                : 'text-gray-900 placeholder-gray-400 text-base'
                            }
            `}
                    />
                </div>
                {isLoading ? (
                    <div className="ml-3 p-3">
                        <Loader2 className={`w-5 h-5 animate-spin ${isHero ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                ) : (
                    <button
                        onClick={() => filteredCities[0] && handleSelect(filteredCities[0])}
                        className={`
                ml-3 p-3 rounded-full transition-all
                ${isHero
                                ? 'bg-[#FF385C] hover:bg-[#D90B3E] text-white'
                                : 'bg-[#FF385C] hover:bg-[#D90B3E] text-white'
                            }
              `}
                    >
                        <Search className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Dropdown - using portal to escape scroll container */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && filteredCities.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                                width: dropdownPosition.width,
                            }}
                            className={`
                                z-[9999]
                                ${isHero
                                    ? 'bg-black/95 backdrop-blur-xl border border-white/10'
                                    : 'bg-white border border-gray-200 shadow-2xl'
                                }
                                rounded-2xl overflow-hidden
                            `}
                        >
                            {/* Header */}
                            <div className={`px-4 py-3 border-b ${isHero ? 'border-white/10' : 'border-gray-100'}`}>
                                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${isHero ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {query.length === 0 ? (
                                        <>
                                            <TrendingUp className="w-3 h-3" />
                                            Trending in California
                                        </>
                                    ) : isLoading ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-3 h-3" />
                                            {filteredCities.length} destination{filteredCities.length !== 1 ? 's' : ''} found
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* City List */}
                            <div className="max-h-56 overflow-y-auto">
                                {filteredCities.map((city, index) => (
                                    <motion.div
                                        key={city.slug}
                                        onClick={() => handleSelect(city)}
                                        className={`
                                            flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors
                                            ${highlightedIndex === index
                                                ? (isHero ? 'bg-white/10' : 'bg-gray-50')
                                                : ''
                                            }
                                            ${isHero ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                                        `}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                    >
                                        {/* City Image or Icon */}
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 flex items-center justify-center">
                                            {city.image ? (
                                                <img
                                                    src={city.image}
                                                    alt={city.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <MapPin className={`w-5 h-5 ${isHero ? 'text-gray-500' : 'text-gray-400'}`} />
                                            )}
                                        </div>

                                        {/* City Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold ${isHero ? 'text-white' : 'text-gray-900'}`}>
                                                {city.name}
                                            </div>
                                            <div className={`text-sm truncate ${isHero ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {city.region}{city.description && city.description !== city.region ? ` • ${city.description.slice(0, 40)}...` : ''}
                                            </div>
                                        </div>

                                        {/* Tags (only for featured cities) */}
                                        {city.tags && city.tags.length > 0 && (
                                            <div className="hidden md:flex gap-1 flex-shrink-0">
                                                {city.tags.slice(0, 2).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className={`
                                                            text-[10px] font-bold uppercase px-2 py-1 rounded-full
                                                            ${isHero
                                                                ? 'bg-white/10 text-gray-300'
                                                                : 'bg-gray-100 text-gray-600'
                                                            }
                                                        `}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className={`px-4 py-3 border-t ${isHero ? 'border-white/10' : 'border-gray-100'}`}>
                                <div className={`text-xs ${isHero ? 'text-gray-500' : 'text-gray-400'}`}>
                                    🌴 Search any California city
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
