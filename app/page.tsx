'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/city-bg.jpg')" }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-50 z-0"></div>

      {/* Content */}
      <div className="relative z-10 bg-white bg-opacity-90 shadow-xl rounded-2xl p-10 max-w-md w-full text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-4">
          <Image src="/nearme-logo.png" alt="NearMe Logo" width={60} height={60} className="mx-auto" />
        </div>

        <h1 className="text-3xl font-bold text-blue-800">Welcome to NearMe</h1>
        <p className="text-gray-600 mt-2">Find trusted local service providers near you.</p>

        <div className="mt-8 space-y-4">
          <Link href="/login">
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition duration-300">
              Log In
            </button>
          </Link>
          <Link href="/signup">
            <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl hover:bg-blue-100 transition duration-300">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
