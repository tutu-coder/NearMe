'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'provider'>('client');
  const [errorMsg, setErrorMsg] = useState('');

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg('');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setErrorMsg(error.message);
    return;
  }

  const user = data.user;
  if (!user) {
    setErrorMsg('Login failed. No user returned.');
    return;
  }

  // ⬇️ Ensure the profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Profile check failed:', profileError.message);
    setErrorMsg('Error checking profile: ' + profileError.message);
    return;
  }

  // ⬇️ If no profile, insert one
  if (!profile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      role: role,
    });

    if (insertError) {
      setErrorMsg('Profile not found, and failed to create one. Contact support.');
      return;
    }
  }

  // ⬇️ If provider role, check/create provider record
  if (role === 'provider') {
    const { data: existingProvider, error: providerCheckError } = await supabase
      .from('providers')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (providerCheckError) {
      console.error('Provider check failed:', providerCheckError.message);
      setErrorMsg('Error checking provider: ' + providerCheckError.message);
      return;
    }

    if (!existingProvider) {
      const { error: providerInsertError } = await supabase.from('providers').insert({
        user_id: user.id,
        business_name: ' ',
        location: ' ',
        service_type: ' ',
        profile_image: ' ',
        business_email: user.email,
        phone_number: '',
        
      });

     if (providerInsertError) {
  console.error('❌ Provider insert error:', providerInsertError);
  alert(`Supabase error: ${providerInsertError.message}`);
  setErrorMsg('Provider record failed to create. Check console and contact support.');
  console.error('❌ Provider insert error:', providerInsertError);
alert(
  `Provider insert failed:\nMessage: ${providerInsertError.message}\nDetails: ${providerInsertError.details || 'N/A'}\nHint: ${providerInsertError.hint || 'N/A'}`
);

  return;
  
}

    }
  }

// ✅ Redirect to appropriate page
if (role === 'client') {
  router.push('/services');
} else {
  // 🔁 Fetch provider record by user_id to get the unique provider `id`
  const { data: providerRecord, error: fetchProviderError } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (fetchProviderError || !providerRecord) {
    setErrorMsg('Failed to fetch provider profile after login.');
    return;
  }

  // ✅ Redirect using provider’s unique `id`
  router.push(`/provider/${providerRecord.id}`);
}

};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>

        {errorMsg && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-center space-x-6 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="client"
                checked={role === 'client'}
                onChange={() => setRole('client')}
                className="accent-blue-600"
              />
              <span className="text-gray-700 text-sm">Client</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="provider"
                checked={role === 'provider'}
                onChange={() => setRole('provider')}
                className="accent-blue-600"
              />
              <span className="text-gray-700 text-sm">Provider</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200 shadow-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
