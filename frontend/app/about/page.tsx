"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-9xl font-bold tracking-tighter mb-12"
                >
                    The Manifesto.
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-12 text-xl md:text-3xl font-light leading-relaxed text-gray-300"
                >
                    <p>
                        We believe that <span className="text-white font-normal">backtracking is a sin</span>.
                        Time is the only non-renewable resource, and spending it driving back and forth
                        across a city or state is a tragic waste.
                    </p>
                    <p>
                        Existing travel tools are dumb. They give you a list of 10 places and say "Good luck."
                        You end up zigzagging across town, exhausted and frustrated.
                    </p>
                    <p>
                        <span className="text-[#FF385C]">Odyssey is different.</span> We use the same algorithms that
                        logistics giants use to route delivery trucks, applied to your joy.
                        We optimize your route so you flow like water through a destination.
                    </p>
                    <p>
                        See more. Drive less.
                        <br />This is the future of travel.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
