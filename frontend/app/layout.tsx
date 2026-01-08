import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Odyssey | The Zero-Backtrack Trip Planner",
  description: "Plan your perfect trip with AI.",
};

import SmoothScrolling from "@/components/SmoothScrolling";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SmoothScrolling>
          <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/10 h-20 flex items-center justify-between px-6 md:px-12 lg:px-24 transition-all duration-500">
            <a href="/" className="flex items-center gap-2 font-bold text-3xl tracking-tighter cursor-pointer text-white hover:text-[#FF385C] transition-colors">
              odyssey.
            </a>
            <div className="flex items-center gap-6">
              <button className="text-sm font-medium text-white hover:text-[#FF385C] transition-colors">Login</button>
              <button className="bg-[#FF385C] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#D90B3E] hover:scale-105 transition-all shadow-lg shadow-[#FF385C]/30">
                Get Started
              </button>
            </div>
          </nav>
          <main className="min-h-screen bg-black text-white">
            {children}
          </main>
        </SmoothScrolling>
      </body>
    </html>
  );
}
