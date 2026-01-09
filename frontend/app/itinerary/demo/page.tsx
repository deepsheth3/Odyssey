"use client";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowDown, Loader2 } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import { useEffect, useState } from "react";
import { optimizeRoute, getRouteDetails, OptimizeRouteResponse, RouteDetailsResponse } from "@/services/api";

// Demo trip data with addresses for the API
const tripStops = [
    {
        time: "09:00 AM",
        title: "Breakfast at Ken's",
        address: "Ken's Creekside Restaurant, Sedona, AZ",
        desc: "The best pancakes in Sedona.",
        icon: "🥞"
    },
    {
        time: "10:30 AM",
        title: "Cathedral Rock Hike",
        address: "Cathedral Rock Trailhead, Sedona, AZ",
        desc: "Optimized route to avoid the crowds.",
        icon: "🥾"
    },
    {
        time: "01:00 PM",
        title: "Tlaquepaque Arts",
        address: "Tlaquepaque Arts & Shopping Village, Sedona, AZ",
        desc: "Lunch and shopping.",
        icon: "🎨"
    },
    {
        time: "03:30 PM",
        title: "Chapel of the Holy Cross",
        address: "Chapel of the Holy Cross, Sedona, AZ",
        desc: "Perfect lighting for photos.",
        icon: "📸"
    },
    {
        time: "06:00 PM",
        title: "Mariposa Latin Grill",
        address: "Mariposa Latin Inspired Grill, Sedona, AZ",
        desc: "Sunset dinner with a view.",
        icon: "🍷"
    },
];

export default function DemoItinerary() {
    const [timeSaved, setTimeSaved] = useState<string>("--");
    const [totalDriveTime, setTotalDriveTime] = useState<string>("--");
    const [routeDetails, setRouteDetails] = useState<RouteDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRouteData() {
            try {
                setLoading(true);

                // Get all addresses
                const addresses = tripStops.map(stop => stop.address);
                const startLocation = "Sedona, AZ"; // Starting point

                // Optimize the route and get time saved
                const optimizeResult = await optimizeRoute({
                    start: startLocation,
                    stops: addresses,
                    end: startLocation // Round trip back to start
                });

                setTimeSaved(optimizeResult.time_saved_formatted);

                // Get route details for the optimized order
                const details = await getRouteDetails(optimizeResult.optimized_order);
                setRouteDetails(details);
                setTotalDriveTime(details.total_duration_formatted);

            } catch (err) {
                console.error("Failed to fetch route data:", err);
                setError("Could not load route data. Using demo values.");
                // Fallback to placeholder values
                setTimeSaved("12 min");
                setTotalDriveTime("45 min");
            } finally {
                setLoading(false);
            }
        }

        fetchRouteData();
    }, []);

    return (
        <div className="min-h-screen bg-white text-black pt-32 pb-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
                    <div>
                        <div className="text-[#FF385C] font-bold tracking-widest uppercase text-xs mb-2">Sample Itinerary</div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">Day 1 in Sedona</h1>
                        <p className="text-gray-500 mt-4 text-xl">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Calculating optimal route...
                                </span>
                            ) : (
                                <>Total drive time: <span className="font-semibold text-black">{totalDriveTime}</span></>
                            )}
                        </p>
                    </div>
                    <MagneticButton className="mt-6 md:mt-0 bg-black text-white px-8 py-4 rounded-full font-bold">
                        Edit this trip
                    </MagneticButton>
                </div>

                <div className="relative border-l-2 border-gray-100 ml-4 md:ml-12 pl-12 space-y-16">
                    {tripStops.map((stop, i) => (
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
                                        {/* Show drive time from previous stop */}
                                        {routeDetails && i > 0 && routeDetails.segments[i - 1] && (
                                            <span className="text-[#FF385C] normal-case">
                                                • {routeDetails.segments[i - 1].duration_text} drive
                                            </span>
                                        )}
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
                        <div className="text-3xl font-bold">
                            {loading ? (
                                <span className="flex items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Calculating savings...
                                </span>
                            ) : (
                                <>You saved <span className="text-green-600">{timeSaved}</span> of driving today.</>
                            )}
                        </div>
                        {error && (
                            <p className="text-sm text-gray-400 mt-2">{error}</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
