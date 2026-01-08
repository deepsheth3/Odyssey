"use client";
import { motion } from "framer-motion";

export default function CaravanLoader() {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-32 h-32 text-[#FF385C]">
                {/* Static Caravan Body */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    className="w-full h-full drop-shadow-2xl"
                >
                    {/* Main Body (No Wheels) */}
                    <path d="M464 224h-38.6c-4.2-22.8-24.2-40-48.2-40-15.8 0-29.9 7.6-38.9 19.3-17.6-9.1-39.7-14.9-63.3-17.6V24c0-13.3-10.7-24-24-24h-80c-13.3 0-24 10.7-24 24v161.7c-23.6 2.7-45.7 8.5-63.3 17.6C74.1 191.6 60 184 44.2 184c-24 0-44 17.2-48.2 40H22.7c-17.2 0-31.4 17.6-21.7 34.7l50.2 88.8c.8 1.4 1.7 2.8 2.7 4.2 7.7 26.6 32.2 46.2 61.4 46.2 24.2 0 45.2-13.5 56.4-33.8 15.6 3.6 32 5.8 48.9 6.4v39.1c-13.5 4.9-23.2 17.8-23.2 32.9 0 19.3 15.7 35 35 35s35-15.7 35-35c0-15.1-9.7-28-23.2-32.9v-39.1c16.9-.6 33.3-2.8 48.9-6.4 11.2 20.2 32.2 33.8 56.4 33.8 29.2 0 53.7-19.6 61.4-46.2 1-.3 1.9-1.7 2.7-2.9l50.2-88.7c9.8-17.1-4.4-34.7-21.6-34.7z" />
                </svg>

                {/* Wheel 1 (Front) */}
                <motion.div
                    className="absolute bottom-1 left-[116px] w-[50px] h-[50px] bg-black rounded-full border-4 border-white flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                >
                    <div className="w-1 h-1 bg-white rounded-full absolute top-2" />
                    <div className="w-4 h-4 bg-gray-500 rounded-full" />
                </motion.div>

                {/* Wheel 2 (Back) */}
                <motion.div
                    className="absolute bottom-1 left-[268px] w-[50px] h-[50px] bg-black rounded-full border-4 border-white flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                >
                    <div className="w-1 h-1 bg-white rounded-full absolute top-2" />
                    <div className="w-4 h-4 bg-gray-500 rounded-full" />
                </motion.div>
            </div>

            <motion.p
                className="mt-8 text-black font-mono text-sm uppercase tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                Loading Adventure...
            </motion.p>
        </div>
    );
}
