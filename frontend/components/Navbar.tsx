'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();

    // Don't show navbar on login/signup pages if you prefer, strictly speaking it's fine though.
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-6 md:px-12 lg:px-24 transition-all duration-500">
            <Link href="/" className="flex items-center gap-2 font-bold text-3xl tracking-tighter cursor-pointer text-white hover:text-[#FF385C] transition-colors">
                odyssey.
            </Link>

            {!loading && (
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-gray-300 hidden md:block">
                                {user.email}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm font-medium text-white hover:text-[#FF385C] transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-white hover:text-[#FF385C] transition-colors">
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="bg-[#FF385C] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#D90B3E] hover:scale-105 transition-all shadow-lg shadow-[#FF385C]/30"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
