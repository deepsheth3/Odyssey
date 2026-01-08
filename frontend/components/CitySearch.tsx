'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, TrendingUp } from 'lucide-react';
import { City, CitiesData } from '@/types';
import { createPortal } from 'react-dom';

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

export default function CitySearch({
    onSelect,
    placeholder = "Where in California?",
    autoFocus = false,
    variant = 'hero'
}: CitySearchProps) {
    const [query, setQuery] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });
    const [mounted, setMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
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

    // Load cities data
    useEffect(() => {
        fetch('/data/california-cities.json')
            .then(res => res.json())
            .then((data: CitiesData) => setCities(data.cities))
            .catch(console.error);
    }, []);

    // Filter cities based on query
    useEffect(() => {
        if (query.length === 0) {
            // Show trending cities when no query
            setFilteredCities(cities.slice(0, 6));
        } else {
            const filtered = cities.filter(city =>
                city.name.toLowerCase().includes(query.toLowerCase()) ||
                city.region.toLowerCase().includes(query.toLowerCase()) ||
                city.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
            setFilteredCities(filtered.slice(0, 8));
        }
        setHighlightedIndex(0);
    }, [query, cities]);

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
            router.push(`/discover/${city.slug}`);
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
                                        {/* City Image */}
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={city.image}
                                                alt={city.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* City Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold ${isHero ? 'text-white' : 'text-gray-900'}`}>
                                                {city.name}
                                            </div>
                                            <div className={`text-sm truncate ${isHero ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {city.region} • {city.description.slice(0, 40)}...
                                            </div>
                                        </div>

                                        {/* Tags */}
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
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className={`px-4 py-3 border-t ${isHero ? 'border-white/10' : 'border-gray-100'}`}>
                                <div className={`text-xs ${isHero ? 'text-gray-500' : 'text-gray-400'}`}>
                                    🌴 Explore all of California — more cities coming soon
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
