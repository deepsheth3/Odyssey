"use client";
import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-24 pb-12 border-t border-white/10 rounded-t-[3rem] -mt-12 relative z-40">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-3xl font-bold tracking-tighter mb-6 flex items-center gap-2">
                            odyssey. <span className="text-[#FF385C] text-sm font-mono bg-white/10 px-2 py-1 rounded">BETA</span>
                        </h2>
                        <p className="text-gray-400 max-w-sm mb-8">
                            The world's first Zero-Backtrack trip planner.
                            We use Operations Research and AI to ensure you never drive the same road twice.
                        </p>
                        <div className="flex gap-4">
                            <div className="p-3 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"><Twitter size={20} /></div>
                            <div className="p-3 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"><Instagram size={20} /></div>
                            <div className="p-3 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"><Linkedin size={20} /></div>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Explore</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">Manifesto</Link></li>
                            <li><Link href="/itinerary/demo" className="hover:text-white transition-colors">Demo Trip</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Destinations</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Company</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; 2024 Odyssey AI Inc. All rights reserved.</p>
                    <p className="flex items-center gap-1 mt-4 md:mt-0">
                        Made with <Heart size={14} className="text-[#FF385C]" /> in San Francisco
                    </p>
                </div>
            </div>
        </footer>
    );
}
