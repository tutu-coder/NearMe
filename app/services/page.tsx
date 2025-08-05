'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import emailjs from '@emailjs/browser';

export default function ServicesPage() {
  const [serviceType, setServiceType] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });

  const categories = [
    { name: 'Painters', icon: '🎨' },
    { name: 'Home Cleaners', icon: '🧼' },
    { name: 'Gardeners', icon: '🌿' },
    { name: 'Electricians', icon: '💡' },
    { name: 'Plumbers', icon: '🔧' },
    { name: 'Movers', icon: '📦' },
    { name: 'Tutors', icon: '📚' },
    { name: 'Mechanics', icon: '🚗' },
  ];

  useEffect(() => {
    const searchProviders = async () => {
      if (!serviceType && !location) {
        setResults([]);
        return;
      }

      setLoading(true);

      let query = supabase.from('providers').select('*');

      if (serviceType && location) {
        query = query
          .or(`service_type.ilike.%${serviceType}%,keywords.ilike.%${serviceType}%`)
          .ilike('location', `%${location}%`);
      } else if (serviceType) {
        query = query.or(`service_type.ilike.%${serviceType}%,keywords.ilike.%${serviceType}%`);
      } else if (location) {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error.message);
        setResults([]);
      } else {
        setResults(data || []);
      }

      setLoading(false);
    };

    searchProviders();
  }, [serviceType, location]);

  const handleSendEmail = async (e: any) => {
    e.preventDefault();
    if (!selectedProvider) return;

    const templateParams = {
      from_name: formData.name,
      reply_to: formData.contact,
      message: formData.message,
      to_email: selectedProvider.business_email,
    };

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      alert('Email sent successfully!');
      setShowModal(false);
      setFormData({ name: '', contact: '', message: '' });
    } catch (error) {
      console.error('Email sending error:', error);
      alert('Failed to send email.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Find a Local Service</h1>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4 mb-12">
        <input
          type="text"
          placeholder="What service are you looking for?"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Enter your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <p className="text-center text-gray-500">Searching...</p>}

      {!loading && results.length === 0 && (serviceType || location) && (
        <p className="text-center text-gray-400 mt-8">No matching providers found.</p>
      )}

      {results.length > 0 && (
        <div className="max-w-5xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-6">
          {results.map((provider) => (
            <div key={provider.id} className="bg-white p-4 rounded-xl shadow flex flex-col justify-between">
              <div>
                <img
                  src={provider.profile_image || '/placeholder.png'}
                  alt="Provider Logo"
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
                <h3 className="font-bold text-lg">{provider.business_name}</h3>
                <p className="text-sm text-gray-600">{provider.description}</p>
                <p className="text-sm text-gray-500">{provider.service_type}</p>
                <p className="text-sm text-gray-500 mt-2">{provider.location}</p>
                <p className="text-sm text-gray-500 mt-2">{provider.business_email}</p>
                <p className="text-sm text-gray-500">{provider.phone_number}</p>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {provider.phone_number && (
                  <a
                    href={`https://wa.me/${provider.phone_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white text-center py-2 rounded hover:bg-green-600 transition"
                  >
                    WhatsApp
                  </a>
                )}

                {provider.business_email && (
                  <button
                    onClick={() => {
                      setSelectedProvider(provider);
                      setShowModal(true);
                    }}
                    className="bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600 transition"
                  >
                    Send Email
                  </button>
                )}

                <a
                  href={`/ratings/${provider.id}`}
                  className="bg-yellow-500 text-white text-center py-2 rounded hover:bg-yellow-600 transition"
                >
                  View Ratings
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Contact {selectedProvider?.business_name}</h2>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Your Email or Phone"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <textarea
                placeholder="What do you need help with?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border p-2 rounded"
                rows={4}
                required
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-700 mt-16 mb-4">Popular Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow hover:shadow-md p-6 flex flex-col items-center justify-center transition cursor-pointer"
            onClick={() => setServiceType(cat.name)}
          >
            <div className="text-4xl mb-2">{cat.icon}</div>
            <div className="text-gray-800 font-medium">{cat.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
