'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import { Search, PenTool, Code, BarChart, Video, Mic, Camera, Mail, MessageCircle, Star } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import emailjs from '@emailjs/browser';

type HeroSearchProps = {
  serviceType: string;
  setServiceType: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  locationFocused: boolean;
  onSearch: () => void;
};

function HeroSearch({ serviceType, setServiceType, location, setLocation, locationFocused, onSearch }: HeroSearchProps) {
  return (
    <section className="relative bg-gray-50 pt-20 pb-32 overflow-hidden">
      {/* Rainbow blurred background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-r from-yellow-300 via-green-400 to-teal-400 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>

      <div className="container mx-auto px-4 text-center relative z-10 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-gray-900"
        >
          Find the perfect <span className="text-blue-600">freelance</span> services for your business
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
        >
          Access a pool of top-tier talent for any project, from design to development. Secure, fast, and professional.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto mt-6"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="What service do you need?"
                className="w-full pl-10 h-14 rounded-2xl border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition placeholder-gray-400 text-gray-900"
              />
            </div>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className={`h-14 rounded-2xl px-4 border shadow-lg ${
                locationFocused ? 'border-blue-600' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-600 transition placeholder-gray-400 text-gray-900`}
            />

            <button
              onClick={onSearch}
              className="h-14 px-6 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg transition"
            >
              Search
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type Category = {
  name: string;
  slug: string;
  icon: React.ReactNode;
};

const CATEGORIES: Category[] = [
  { name: 'Graphics Design', slug: 'graphics-design', icon: <PenTool className="w-6 h-6" /> },
  { name: 'Programming', slug: 'programming', icon: <Code className="w-6 h-6" /> },
  { name: 'Digital Marketing', slug: 'digital-marketing', icon: <BarChart className="w-6 h-6" /> },
  { name: 'Video Animation', slug: 'video-animation', icon: <Video className="w-6 h-6" /> },
  { name: 'Writing', slug: 'writing', icon: <Mic className="w-6 h-6" /> },
  { name: 'Photography', slug: 'photography', icon: <Camera className="w-6 h-6" /> },
];

const POPULAR_SERVICES = [
  {
    name: 'Alice Johnson',
    service: 'Website Design',
    img: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=200&q=60',
  },
  {
    name: 'Mark Smith',
    service: 'Logo & Branding',
    img: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
  },
  {
    name: 'Sarah Lee',
    service: 'WordPress & CMS',
    img: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=200&q=60',
  },
  {
    name: 'David Kim',
    service: 'AI‑Driven Automation',
    img: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

export default function ServicesPage() {
  const [serviceType, setServiceType] = useState('');
  const [location, setLocation] = useState('');
  const [locationFocused, setLocationFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });

  // Updated fetchProviders to accept optional term/location
  const fetchProviders = async (searchTerm?: string, searchLocation?: string) => {
    const term = searchTerm ?? serviceType;
    const loc = searchLocation ?? location;

    if (!term && !loc) {
      setResults([]);
      return;
    }

    setLoading(true);

    let query = supabase.from('providers').select('*');

    if (term && loc) {
      query = query
        .or(
          `service_type.ilike.%${term}%,keywords.ilike.%${term}%,business_name.ilike.%${term}%,description.ilike.%${term}%`
        )
        .ilike('location', `%${loc}%`);
    } else if (term) {
      query = query.or(
        `service_type.ilike.%${term}%,keywords.ilike.%${term}%,business_name.ilike.%${term}%,description.ilike.%${term}%`
      );
    } else if (loc) {
      query = query.ilike('location', `%${loc}%`);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HERO SEARCH */}
      <HeroSearch
        serviceType={serviceType}
        setServiceType={setServiceType}
        location={location}
        setLocation={setLocation}
        locationFocused={locationFocused}
        onSearch={() => fetchProviders()}
      />

      {/* SEARCH RESULTS ABOVE CATEGORY GRID */}
      <section className="container mx-auto px-4 mt-10">
        {loading && <p className="text-center text-gray-500">Searching...</p>}

        {!loading && results.length === 0 && (serviceType || location) && (
          <p className="text-center text-gray-400 mt-8">No matching providers found.</p>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((provider) => (
              <div key={provider.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
                <div>
                  <img
                    src={provider.profile_image || '/placeholder.png'}
                    alt={provider.business_name}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                  <h3 className="font-bold text-lg">{provider.business_name}</h3>
                  <p className="text-gray-500">{provider.service_type}</p>
                  <p className="text-gray-500">{provider.location}</p>
                </div>

                {/* Modern compact action buttons */}
                <div className="mt-4 flex justify-center gap-4">
                  {provider.phone_number && (
                    <a
                      href={`https://wa.me/${provider.phone_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm transition"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  )}

                  {provider.business_email && (
                    <button
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm transition"
                    >
                      <Mail className="w-4 h-4" /> Email
                    </button>
                  )}

                  <a
                    href={`/ratings/${provider.id}`}
                    className="flex items-center gap-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-sm transition"
                  >
                    <Star className="w-4 h-4" /> Ratings
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CATEGORY GRID BELOW RESULTS */}
      <section className="container mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.slug}
              onClick={() => fetchProviders(cat.name, location)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group flex flex-col items-center justify-center p-6 border border-gray-300 rounded-2xl 
                         hover:border-blue-600 hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                {cat.icon}
              </div>
              <span className="mt-2 text-gray-800 group-hover:text-blue-600 font-medium transition">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* EMAIL MODAL */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4">Contact {selectedProvider.business_name}</h2>
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
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPULAR PROFESSIONAL SERVICES */}
      <section className="container mx-auto px-4 mt-16">
        <h2 className="text-4xl font-bold mb-8 text-gray-900 text-center">Popular Professional Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_SERVICES.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <img
                src={p.img}
                alt={p.name}
                className="mx-auto w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-200"
              />
              <p className="font-semibold text-lg text-gray-900">{p.name}</p>
              <p className="text-gray-500">{p.service}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <section className="mt-16 bg-gray-100 py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-700">
          <div>
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug} className="hover:text-blue-600 cursor-pointer transition">
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li className="hover:text-blue-600 cursor-pointer transition">Help Center</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Contact</li>
              <li className="hover:text-blue-600 cursor-pointer transition">FAQs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <ul className="space-y-2">
              <li className="hover:text-blue-600 cursor-pointer transition">Our Story</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Careers</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Blog</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li className="hover:text-blue-600 cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-blue-600 cursor-pointer transition">Terms of Service</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
