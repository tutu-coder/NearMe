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
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
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

      setName(profileData?.name || '');
      setSurname(profileData?.surname || '');

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

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name, surname })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error.message);
      alert('Failed to update profile.');
    } else {
      setUser({ ...user, name, surname });
      setEditing(false);
      alert('Profile updated successfully!');
    }
  };

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
        {editing ? (
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <p>{user.name}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block font-semibold">Surname</label>
        {editing ? (
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        ) : (
          <p>{user.surname}</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block font-semibold">Email</label>
        <p>{user.email}</p>
      </div>

      {editing ? (
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Profile
        </button>
      )}

      {providerProfile && (
        <div className="mt-10 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-3">Business Profile</h2>
          <p>
            <strong>Business Name:</strong> {providerProfile.business_name}
          </p>
          <p>
            <strong>Business Email:</strong> {providerProfile.business_email}
          </p>

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
