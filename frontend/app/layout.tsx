import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

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
        <AuthProvider>
          <SmoothScrolling>
            <Navbar />
            <main className="min-h-screen bg-black text-white">
              {children}
            </main>
          </SmoothScrolling>
        </AuthProvider>
      </body>
    </html>
  );
}
