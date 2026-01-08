"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export default function JourneyLine() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"]
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Pin appears slightly earlier now (75% to 90%)
    const pinOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);
    const pinScale = useTransform(scrollYProgress, [0.75, 0.9], [0.5, 1]);

    // Normalized Path (0 to 1 scaling space)
    // We'll use a viewBox of 0 0 100 100.
    // CRITICAL CHANGE: End the path at Y=80 (20% from bottom).
    // This ensures it stops BEFORE the footer (which is roughly the bottom 15-20% of the page).
    const pathD = `
    M 10 0
    C 10 20, 40 30, 40 40
    C 40 50, 5 60, 5 70
    C 5 75, 25 78, 25 80`;

    return (
        <div ref={ref} className="absolute left-0 top-0 w-full h-full pointer-events-none z-50 hidden md:block overflow-hidden">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                preserveAspectRatio="none"
            >
                {/* Shadow/Glow for visibility */}
                <filter id="glow">
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Dotted Background Line - White 40% */}
                <path
                    d={pathD}
                    stroke="white"
                    strokeOpacity="0.4"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                />

                {/* Animated Fill Line - Odyssey Red */}
                <motion.path
                    d={pathD}
                    stroke="#FF385C"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeDasharray="2 2"
                    style={{ pathLength }}
                    vectorEffect="non-scaling-stroke"
                    filter="url(#glow)"
                />
            </svg>

            {/* Destination Pin at bottom */}
            {/* Aligned to end of path (X=25, Y=80 -> Bottom 20%) */}
            <motion.div
                style={{ opacity: pinOpacity, scale: pinScale }}
                className="absolute bottom-[20%] left-[25%] -translate-x-1/2 translate-y-1/2 text-[#FF385C] z-[60]"
            >
                <MapPin size={48} fill="#FF385C" className="text-white drop-shadow-2xl" />
            </motion.div>
        </div>
    );
}
