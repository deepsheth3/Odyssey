"use client";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowDown } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";

export default function DemoItinerary() {
    const trip = [
        { time: "09:00 AM", title: "Breakfast at Ken's", desc: "The best pancakes in Sedona.", icon: "🥞" },
        { time: "10:30 AM", title: "Cathedral Rock Hike", desc: "Optimized route to avoid the crowds.", icon: "🥾" },
        { time: "01:00 PM", title: "Tlaquepaque Arts", desc: "Lunch and shopping. Just 10 min drive.", icon: "🎨" },
        { time: "03:30 PM", title: "Chapel of the Holy Cross", desc: "Perfect lighting for photos.", icon: "📸" },
        { time: "06:00 PM", title: "Mariposa Latin Grill", desc: "Sunset dinner with a view.", icon: "🍷" },
    ];

    return (
        <div className="min-h-screen bg-white text-black pt-32 pb-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                    <div>
                        <div className="text-[#FF385C] font-bold tracking-widest uppercase text-xs mb-2">Sample Itinerary</div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Day 1 in Sedona</h1>
                        <p className="text-gray-500 mt-4 text-xl">0 mins of backtracking using Odyssey AI.</p>
                    </div>
                    <MagneticButton className="mt-6 md:mt-0 bg-black text-white px-8 py-4 rounded-full font-bold">
                        Edit this trip
                    </MagneticButton>
                </div>

                <div className="relative border-l-2 border-gray-100 ml-4 md:ml-12 pl-12 space-y-16">
                    {trip.map((stop, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative"
                        >
                            {/* Timeline Node */}
                            <div className="absolute -left-[59px] top-0 w-8 h-8 rounded-full bg-white border-4 border-black flex items-center justify-center z-10">
                                {i === 0 ? <div className="w-2 h-2 bg-black rounded-full" /> : null}
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="text-4xl">{stop.icon}</div>
                                <div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        <Clock size={14} /> {stop.time}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{stop.title}</h3>
                                    <p className="text-gray-600 text-lg">{stop.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Efficiency Stat */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-[#f7f7f7] rounded-3xl p-8 mt-12 border border-gray-200"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="text-green-500 bg-green-100 p-2 rounded-full"><ArrowDown size={20} /></div>
                            <span className="font-bold text-green-600 uppercase text-xs tracking-widest">Efficiency Score</span>
                        </div>
                        <div className="text-3xl font-bold">You saved 42 mins of driving today.</div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
