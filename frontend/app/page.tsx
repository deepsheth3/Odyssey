"use client";
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MagneticButton from '@/components/MagneticButton';
import { TextReveal } from '@/components/TextReveal';
import JourneyLine from '@/components/JourneyLine';
import Footer from '@/components/Footer';
import CitySearch from '@/components/CitySearch';

export default function Home() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 200]);

  // California Destinations
  const destinations = [
    { title: "San Francisco", tag: "Iconic", img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&auto=format&fit=crop&q=80" },
    { title: "Big Sur", tag: "Coastal", img: "https://images.unsplash.com/photo-1473442240418-452f03b7ae40?w=1200&auto=format&fit=crop&q=80" },
    { title: "Yosemite", tag: "Nature", img: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&auto=format&fit=crop&q=80" },
    { title: "Napa Valley", tag: "Wine", img: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="relative">
      <JourneyLine />

      {/* 1. Cinematic Hero Section */}
      <section ref={targetRef} className="min-h-screen pt-20 relative flex flex-col items-center justify-center">
        {/* Background Image: California Landscape */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=2400&auto=format&fit=crop&q=80"
            className="w-full h-full object-cover brightness-[0.6]"
            alt="California Coast"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
        </div>

        {/* Hero Text - Fades on scroll */}
        <motion.div
          style={{ opacity, scale, y }}
          className="relative z-40 w-full max-w-4xl px-6 flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="text-[#FF385C] font-bold text-sm uppercase tracking-widest">
              California Day Trips
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-6"
          >
            One Day.<br />Zero Backtracking.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-gray-200 mb-10 font-light max-w-2xl tracking-wide"
          >
            Tell us where you&apos;re going and what you love.
            We&apos;ll build the perfect itinerary with optimized routing.
          </motion.p>
        </motion.div>

        {/* City Search - Does NOT fade */}
        <div className="relative z-50 w-full max-w-2xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <CitySearch
              variant="hero"
              placeholder="Try 'San Francisco' or 'wine country'"
            />
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {['San Francisco', 'Napa Valley', 'Big Sur', 'Santa Barbara'].map((city) => (
              <a
                key={city}
                href={`/recommend/${city.toLowerCase().replace(' ', '-')}`}
                className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/10 hover:border-white/30"
              >
                {city}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. Featured California Destinations */}
      <section className="bg-[#0a0a0a] py-32 px-6 md:px-12 lg:px-24 rounded-t-[3rem] -mt-12 relative z-10 border-t border-white/5">
        <div className="flex justify-between items-end mb-16 px-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">California Icons</h2>
            <p className="text-gray-400 text-lg">Curated day trips across the Golden State.</p>
          </div>
          <a
            href="/discover"
            className="hidden md:flex items-center gap-2 text-white border-b border-white/30 pb-1 hover:border-white transition-colors"
          >
            Explore All <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, i) => (
            <motion.a
              key={i}
              href={`/discover/${dest.title.toLowerCase().replace(' ', '-')}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer relative block"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-2xl relative mb-4 bg-gray-900">
                <img
                  src={dest.img}
                  alt={dest.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
                />
                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 text-white">
                  {dest.tag}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">{dest.title}</h3>
                  <div className="text-gray-500 text-xs uppercase tracking-wide">California</div>
                </div>
                <div className="text-white font-mono text-sm bg-white/10 px-2 py-1 rounded-md">
                  4.9 ★
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* 3. The Promise (Value Prop) */}
      <section className="bg-white text-black py-32 px-6 md:px-12 lg:px-24 rounded-t-[3rem] -mt-12 relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-black to-gray-500">
            NO MORE<br />BACKTRACKING.
          </h2>
          <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Our smart routing reorders your California day trip stops geographically.
            Save gas, save time, see more.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/discover/san-francisco"
              className="bg-black text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
            >
              Start with San Francisco
            </a>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}
