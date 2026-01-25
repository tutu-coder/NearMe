'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Menu, X, Briefcase } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);

      if (user) {
        const { data: provider } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (provider) setProviderId(provider.id);
      } else {
        setProviderId(null);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProviderId(null);
    setUser(null);
    router.push('/services');
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/services"
          className="flex items-center gap-2 text-xl md:text-2xl font-bold text-blue-600 tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Briefcase size={18} />
          </div>
          <span>NearMe</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 font-medium text-gray-700">
          <Link href="/services" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/profile" className="hover:text-blue-600 transition-colors">Profile</Link>

          {providerId && (
            <Link
              href={`/provider/${providerId}`}
              className="hover:text-blue-600 font-semibold transition-colors"
            >
              Business Profile
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition-all"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/90 backdrop-blur-md shadow-md border-t border-gray-200">
          <div className="flex flex-col p-4 space-y-3">
            <Link href="/services" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/profile" onClick={() => setIsOpen(false)}>Profile</Link>

            {providerId && (
              <Link
                href={`/provider/${providerId}`}
                onClick={() => setIsOpen(false)}
                className="font-semibold"
              >
                Business Profile
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="text-red-600 text-left"
              >
                Log Out
              </button>
            ) : (
              <button
                onClick={() => { router.push('/'); setIsOpen(false); }}
                className="text-blue-600 text-left"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
