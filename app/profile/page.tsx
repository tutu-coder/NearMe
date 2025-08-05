'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  surname: string | null;
}

interface ProviderProfile {
  id: string;
  business_name: string;
  business_email: string;
  // add other fields if needed
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch basic user info from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, surname')
        .eq('id', user.id)
        .single();

      setUser({
        id: user.id,
        email: user.email || '',
        name: profileData?.name || '',
        surname: profileData?.surname || '',
      });

      // Fetch provider info by user_id
      const { data: providerData } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerData) {
        setProviderProfile(providerData);
      }

      setLoading(false);
    }

    fetchUser();
  }, []);

  const goToBusinessProfile = () => {
    if (providerProfile?.id) {
      router.push(`/provider/${providerProfile.id}`);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  if (!user) return <p>You must be logged in to view your profile.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <div className="mb-6">
        <label className="block font-semibold">Name</label>
        <p>{user.name}</p>
      </div>

      <div className="mb-6">
        <label className="block font-semibold">Surname</label>
        <p>{user.surname}</p>
      </div>

      <div className="mb-6">
        <label className="block font-semibold">Email</label>
        <p>{user.email}</p>
      </div>

      {providerProfile && (
        <div className="mt-10 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-3">Business Profile</h2>
          <p><strong>Business Name:</strong> {providerProfile.business_name}</p>
          <p><strong>Business Email:</strong> {providerProfile.business_email}</p>

          <button
            onClick={goToBusinessProfile}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Business Profile
          </button>
        </div>
      )}
    </div>
  );
}
