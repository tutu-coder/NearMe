'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Service = {
  id?: string; // uuid for existing services, undefined for new
  service_type: string;
  price: string;
  description?: string;
};

export default function ProviderRegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Provider info state
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Services state (list)
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function loadProvider() {
      setLoading(true);
      setErrorMsg(null);

      // Get current user
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      if (!user) {
        setErrorMsg('You must be logged in to register a provider profile.');
        setLoading(false);
        return;
      }

      // Load provider info from providers table
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (providerError && providerError.code !== 'PGRST116') {
        // PGRST116 = no rows found
        setErrorMsg(providerError.message);
        setLoading(false);
        return;
      }

      if (providerData) {
        setBusinessName(providerData.business_name || '');
        setDescription(providerData.description || '');
        setLocation(providerData.location || '');
        setPhone(providerData.phone || '');
        setEmail(providerData.email || '');
        setLogoUrl(providerData.logo_url || '');
      }

      // Load services linked to provider
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id);

      if (servicesError) {
        setErrorMsg(servicesError.message);
        setLoading(false);
        return;
      }

      if (servicesData) {
        setServices(servicesData);
      }

      setLoading(false);
    }

    loadProvider();
  }, []);

  // Handlers for service list

  function handleServiceChange(index: number, field: keyof Service, value: string) {
    setServices((prev) => {
      const newServices = [...prev];
      newServices[index] = { ...newServices[index], [field]: value };
      return newServices;
    });
  }

  function addService() {
    setServices((prev) => [...prev, { service_type: '', price: '', description: '' }]);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    try {
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      if (!user) {
        setErrorMsg('User not authenticated.');
        setSaving(false);
        return;
      }

      // Upsert provider info
      const { error: providerUpsertError } = await supabase
        .from('providers')
        .upsert({
          id: user.id,
          business_name: businessName,
          description,
          location,
          phone,
          email,
          logo_url: logoUrl,
        }, { onConflict: 'id' });

      if (providerUpsertError) {
        setErrorMsg(providerUpsertError.message);
        setSaving(false);
        return;
      }

      // For services: we will delete all existing and insert new ones for simplicity
      // (Alternatively, you can implement diff/patch logic)
      // Delete existing services:
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('provider_id', user.id);

      if (deleteError) {
        setErrorMsg(deleteError.message);
        setSaving(false);
        return;
      }

      // Insert current services, filter out incomplete ones
      const validServices = services.filter(s => s.service_type.trim() && s.price.trim());

      if (validServices.length > 0) {
        const { error: insertError } = await supabase
          .from('services')
          .insert(validServices.map(s => ({
            provider_id: user.id,
            service_type: s.service_type,
            price: parseFloat(s.price),
            description: s.description || null,
          })));

        if (insertError) {
          setErrorMsg(insertError.message);
          setSaving(false);
          return;
        }
      }

      // Redirect to provider profile page
      router.push(`/provider/${user.id}`);

    } catch (error: any) {
      setErrorMsg(error.message || 'An unknown error occurred');
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-2xl font-bold mb-6">Provider Registration</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business info */}
        <div>
          <label className="block font-semibold mb-1" htmlFor="businessName">Business Name</label>
          <input
            id="businessName"
            type="text"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1" htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1" htmlFor="logoUrl">Logo URL</label>
          <input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Services */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Services</h2>

          {services.map((service, i) => (
            <div key={i} className="mb-4 border p-3 rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Service #{i + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Service Type"
                  value={service.service_type}
                  onChange={e => handleServiceChange(i, 'service_type', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={service.price}
                  onChange={e => handleServiceChange(i, 'price', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={service.description || ''}
                  onChange={e => handleServiceChange(i, 'description', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addService}
            className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            + Add Service
          </button>
        </div>

        {errorMsg && (
          <div className="text-red-600 font-semibold">{errorMsg}</div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
}
