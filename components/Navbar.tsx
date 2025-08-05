'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: provider } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (provider) {
        setProviderId(provider.id);
      }
    };

    fetchProviderId();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProviderId(null); // Clear cached provider ID
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between relative">
      <Link href="/" className="text-xl font-bold text-blue-600">
        NearMe
      </Link>

      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-gray-600 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Desktop links */}
      <div className="hidden md:flex space-x-4 items-center">
        
        <Link href="/services" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link href="/profile" className="text-gray-700 hover:text-blue-600">Profile</Link>

        {providerId && (
          <Link
            href={`/provider/${providerId}`}
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Business Profile
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Log Out
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md p-4 space-y-3 z-50">
         
          <Link href="/services" className="block text-gray-700 hover:text-blue-600">Home</Link>
          <Link href="/profile" className="block text-gray-700 hover:text-blue-600">Profile</Link>

          {providerId && (
            <Link
              href={`/provider/${providerId}`}
              className="block text-gray-700 hover:text-blue-600 font-medium"
            >
              Business Profile
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full text-left text-red-600 hover:text-red-800"
          >
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
}
