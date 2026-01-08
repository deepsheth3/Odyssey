"use client";
import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <>
            <motion.div
                className="fixed inset-0 z-[100] pointer-events-none flex items-end"
                initial={{ x: "0%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <div className="relative w-full h-full">
                    {/* The Racing Caravan */}
                    <motion.div
                        className="absolute bottom-10 left-0 w-32 h-32 text-[#FF385C]"
                        initial={{ left: "-10%" }}
                        animate={{ left: "120%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                            <path d="M464 224h-38.6c-4.2-22.8-24.2-40-48.2-40-15.8 0-29.9 7.6-38.9 19.3-17.6-9.1-39.7-14.9-63.3-17.6V24c0-13.3-10.7-24-24-24h-80c-13.3 0-24 10.7-24 24v161.7c-23.6 2.7-45.7 8.5-63.3 17.6C74.1 191.6 60 184 44.2 184c-24 0-44 17.2-48.2 40H22.7c-17.2 0-31.4 17.6-21.7 34.7l50.2 88.8c.8 1.4 1.7 2.8 2.7 4.2 7.7 26.6 32.2 46.2 61.4 46.2 24.2 0 45.2-13.5 56.4-33.8 15.6 3.6 32 5.8 48.9 6.4v39.1c-13.5 4.9-23.2 17.8-23.2 32.9 0 19.3 15.7 35 35 35s35-15.7 35-35c0-15.1-9.7-28-23.2-32.9v-39.1c16.9-.6 33.3-2.8 48.9-6.4 11.2 20.2 32.2 33.8 56.4 33.8 29.2 0 53.7-19.6 61.4-46.2 1-.3 1.9-1.7 2.7-2.9l50.2-88.7c9.8-17.1-4.4-34.7-21.6-34.7zM116.7 80h48.6v32h-48.6V80zm215.3 160c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm-152-48c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48z" />
                        </svg>
                        {/* Speed Lines */}
                        <motion.div
                            className="absolute top-10 -left-10 w-20 h-1 bg-white/50 rounded-full"
                            animate={{ opacity: [0, 1, 0], x: [-10, 0] }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                        />
                        <motion.div
                            className="absolute top-20 -left-16 w-12 h-1 bg-white/30 rounded-full"
                            animate={{ opacity: [0, 1, 0], x: [-10, 0] }}
                            transition={{ repeat: Infinity, duration: 0.4 }}
                        />
                    </motion.div>
                </div>
            </motion.div>
            {children}
        </>
    );
}
