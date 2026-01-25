'use client';

import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      
      {/* Rainbow / Aurora Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#60a5fa,transparent_40%),radial-gradient(circle_at_80%_30%,#a78bfa,transparent_40%),radial-gradient(circle_at_50%_80%,#34d399,transparent_40%)] opacity-70"></div>

      {/* Blur */}
      <div className="absolute inset-0 backdrop-blur-3xl"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white/90 shadow-2xl rounded-3xl 
                      px-6 py-8 sm:px-10 sm:py-10 text-center">
        
        {/* Logo */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Briefcase size={20} className="sm:hidden" />
            <Briefcase size={24} className="hidden sm:block" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-blue-800 tracking-tight">
            NearMe
          </span>
        </div>

        <p className="text-gray-600 text-sm sm:text-base mb-8">
          Find trusted local service providers near you.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <Link href="/login">
            <button className="w-full bg-blue-600 text-white py-3 sm:py-3.5 rounded-2xl 
                               text-sm sm:text-base font-medium
                               hover:bg-blue-700 transition-all duration-300 shadow-md">
              Log In
            </button>
          </Link>

          <Link href="/signup">
            <button className="w-full bg-gray-100 text-gray-800 py-3 sm:py-3.5 rounded-2xl 
                               text-sm sm:text-base font-medium
                               hover:bg-gray-200 transition-all duration-300">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Browse Without Account Message */}
        <p className="mt-6 text-gray-500 text-sm sm:text-base">
          Just want to browse?{' '}
          <Link href="/services" className="text-blue-600 hover:underline font-medium">
            Go to Home
          </Link>
        </p>
      </div>
    </main>
  );
}
