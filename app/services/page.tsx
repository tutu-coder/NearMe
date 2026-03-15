'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Mail,
  MessageCircle,
  Star,
  Phone,
  MapPin,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Trees,
  ShieldCheck,
  Bug,
  Drill,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import emailjs from '@emailjs/browser';

const UNCLAIMED_OWNER_ID = "895572fd-cd63-4344-aea7-e43259a15ef9";

type HeroSearchProps = {
  serviceType: string;
  setServiceType: Dispatch<SetStateAction<string>>;
  location: string;
  setLocation: Dispatch<SetStateAction<string>>;
  locationFocused: boolean;
  setLocationFocused: Dispatch<SetStateAction<boolean>>;
  onSearch: () => void;
};

function HeroSearch({
  serviceType,
  setServiceType,
  location,
  setLocation,
  locationFocused,
  setLocationFocused,
  onSearch,
}: HeroSearchProps) {
  return (
    <section className="relative bg-gray-50 pt-20 pb-32 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-r from-blue-300 via-cyan-400 to-sky-500 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-r from-amber-200 via-orange-300 to-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>

      <div className="container mx-auto px-4 text-center relative z-10 space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-6xl font-bold text-gray-900"
        >
          Find trusted <span className="text-blue-600">home service</span> professionals near you
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
        >
          From plumbers and electricians to cleaners, painters, and gardeners — discover reliable local pros for the jobs that keep your home running.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-5xl mx-auto mt-6"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="Search plumbers, electricians, cleaners..."
                className="w-full pl-10 h-14 rounded-2xl border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition placeholder-gray-400 text-gray-900"
              />
            </div>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => setLocationFocused(false)}
              placeholder="Suburb, city, or area"
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 pt-2 text-sm"
        >
          {['Plumber', 'Electrician', 'Cleaner', 'Painter', 'Gardener'].map((item) => (
            <button
              key={item}
              onClick={() => {
                setServiceType(item);
                onSearch();
              }}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600 shadow-sm transition"
            >
              {item}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

type Category = {
  name: string;
  slug: string;
  searchTerm: string;
  icon: React.ReactNode;
};

const CATEGORIES: Category[] = [
  { name: 'Plumbers', slug: 'plumbers', searchTerm: 'plumber', icon: <Wrench className="w-6 h-6" /> },
  { name: 'Electricians', slug: 'electricians', searchTerm: 'electrician', icon: <Zap className="w-6 h-6" /> },
  { name: 'Cleaners', slug: 'cleaners', searchTerm: 'cleaner', icon: <ShieldCheck className="w-6 h-6" /> },
  { name: 'Painters', slug: 'painters', searchTerm: 'painter', icon: <Paintbrush className="w-6 h-6" /> },
  { name: 'Gardeners', slug: 'gardeners', searchTerm: 'gardener', icon: <Trees className="w-6 h-6" /> },
  { name: 'Handymen', slug: 'handymen', searchTerm: 'handyman', icon: <Hammer className="w-6 h-6" /> },
  { name: 'Pest Control', slug: 'pest-control', searchTerm: 'pest control', icon: <Bug className="w-6 h-6" /> },
  { name: 'Appliance Repair', slug: 'appliance-repair', searchTerm: 'appliance repair', icon: <Drill className="w-6 h-6" /> },
];

const POPULAR_SERVICES = [
  {
    title: 'Plumbing Repairs',
    subtitle: 'Leaks, blocked drains, and geyser issues',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    searchTerm: 'plumber',
  },
  {
    title: 'Electrical Work',
    subtitle: 'Installations, faults, and repairs',
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    searchTerm: 'electrician',
  },
  {
    title: 'Home Cleaning',
    subtitle: 'Reliable cleaners for everyday jobs',
    img: 'https://images.pexels.com/photos/4107129/pexels-photo-4107129.jpeg?auto=compress&cs=tinysrgb&w=1200',
    searchTerm: 'cleaner',
  },
  {
    title: 'Painting Services',
    subtitle: 'Interior and exterior painting pros',
    img: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    searchTerm: 'painter',
  },
];

export default function ServicesPage() {
  const [serviceType, setServiceType] = useState('');
  const [location, setLocation] = useState('');
  const [locationFocused, setLocationFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });
  const [submittedServiceType, setSubmittedServiceType] = useState('');
  const [submittedLocation, setSubmittedLocation] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimProvider, setClaimProvider] = useState<any>(null);
  const [claimForm, setClaimForm] = useState({ name: '', email: '', phone: '', message: '' });
 
  const trackLead = async (providerId: string, type: string) => {
  try {
    await supabase.from("provider_leads").insert({
      provider_id: providerId,
      lead_type: type
    });
  } catch (error) {
    console.error("Lead tracking error:", error);
  }
};

 
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
        .or(`service_type.ilike.%${term}%,keywords.ilike.%${term}%,business_name.ilike.%${term}%,description.ilike.%${term}%`)
        .ilike('location', `%${loc}%`);
    } else if (term) {
      query = query.or(`service_type.ilike.%${term}%,keywords.ilike.%${term}%,business_name.ilike.%${term}%,description.ilike.%${term}%`);
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

  const handleClaimSubmit = async (e: any) => {
    e.preventDefault();

    await supabase.from("provider_claim_requests").insert({
      provider_id: claimProvider.id,
      name: claimForm.name,
      email: claimForm.email,
      phone: claimForm.phone,
      message: claimForm.message,
      status: "pending"
    });

    alert("Claim request submitted.");
    setShowClaimModal(false);
    setClaimForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeroSearch
        serviceType={serviceType}
        setServiceType={setServiceType}
        location={location}
        setLocation={setLocation}
        locationFocused={locationFocused}
        setLocationFocused={setLocationFocused}
        onSearch={() => {
          setSubmittedServiceType(serviceType);
          setSubmittedLocation(location);
          fetchProviders();
        }}
      />

      {/* SEARCH RESULTS */}
      <section className="container mx-auto px-4 mt-10">
        {loading && <p className="text-center text-gray-500">Searching for local pros...</p>}

        {!loading && results.length === 0 && (submittedServiceType || submittedLocation) && (
          <p className="text-center text-gray-400 mt-8">No matching providers found.</p>
        )}

        {results.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Local providers
              </h2>
              <p className="text-gray-600 mt-1">
                {results.length} result{results.length !== 1 ? 's' : ''} found
                {submittedServiceType ? ` for "${submittedServiceType}"` : ''}
                {submittedLocation ? ` in ${submittedLocation}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((provider) => {
                const isUnclaimed = provider.user_id === UNCLAIMED_OWNER_ID;

                return (
                  <div key={provider.id} className="bg-white rounded-xl shadow p-4 flex flex-col justify-between">
                    <div>
                      <img
                        src={provider.profile_image || '/placeholder.png'}
                        alt={provider.business_name}
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />

                      <h3 className="font-bold text-lg text-gray-900">{provider.business_name}</h3>
                      <p className="text-gray-500">{provider.service_type}</p>
                      <p className="text-gray-500">{provider.location}</p>

                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-700 font-medium">
                          {provider.average_rating ? provider.average_rating.toFixed(1) : "New"}
                        </span>
                      </div>

{provider.google_rating != null && provider.google_review_count != null && (
  <div className="mt-1 text-sm text-gray-600">
    <span className="font-medium text-red-500">Google</span>{' '}
    <span className="text-gray-800 font-medium">
      {Number(provider.google_rating).toFixed(1)}
    </span>{' '}
    ({provider.google_review_count} reviews)
  </div>
)}

                      <div className="text-gray-600 text-sm mt-3">
                        <p
                          className={`${expandedDescriptions[provider.id] ? "" : "line-clamp-2"}`}
                          dangerouslySetInnerHTML={{
                            __html: (provider.description || "No description provided")
                              .replace(
                                /(https?:\/\/[^\s]+)/g,
                                '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>'
                              )
                          }}
                        />

                        {provider.description && provider.description.length > 120 && (
                          <button
                            onClick={() =>
                              setExpandedDescriptions(prev => ({
                                ...prev,
                                [provider.id]: !prev[provider.id]
                              }))
                            }
                            className="text-blue-600 text-sm mt-1 hover:underline"
                          >
                            {expandedDescriptions[provider.id] ? "Show less" : "Show more"}
                          </button>
                        )}
                      </div>

                      {isUnclaimed && (
                        <div className="mt-3 text-sm text-center bg-gray-50 border rounded-lg p-2">
                          <p className="text-gray-600">Own this business?</p>
                          <button
                            onClick={() => {
                              setClaimProvider(provider);
                              setShowClaimModal(true);
                            }}
                            className="text-blue-600 font-medium hover:underline"
                          >
                            Claim your profile for free
                          </button>
                        </div>
                      )}
                    </div>

<div className="mt-4 flex flex-wrap justify-center gap-2">

  {provider.phone_number && (
    <a
      onClick={() => trackLead(provider.id, "whatsapp")}
      href={`https://wa.me/${provider.phone_number}?text=${encodeURIComponent(`Hi, I found your business on NearMe and I need a ${provider.service_type}.`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm transition"
    >
      <MessageCircle className="w-4 h-4" /> WhatsApp
    </a>
  )}

  {provider.phone_number && (
    <a
      onClick={() => trackLead(provider.id, "call")}
      href={`tel:${provider.phone_number}`}
      className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full text-sm transition"
    >
      <Phone className="w-4 h-4" /> Call
    </a>
  )}

  {provider.business_email && (
    <button
      onClick={() => {
        trackLead(provider.id, "email");
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

  <a
    onClick={() => trackLead(provider.id, "maps")}
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.business_name + " " + provider.location)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm transition"
  >
    <MapPin className="w-4 h-4" /> Maps
  </a>

</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* CLAIM MODAL */}
      {showClaimModal && claimProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Claim {claimProvider.business_name}</h2>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={claimForm.name}
                onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="email"
                placeholder="Business Email"
                value={claimForm.email}
                onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={claimForm.phone}
                onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <textarea
                placeholder="Tell us how you are related to this business"
                value={claimForm.message}
                onChange={(e) => setClaimForm({ ...claimForm, message: e.target.value })}
                className="w-full border p-2 rounded"
                rows={4}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              />

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

      {/* CATEGORY GRID */}
      <section className="container mx-auto px-4 mt-16">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Browse home services</h2>
            <p className="text-gray-600 mt-1">
              Explore the most searched household services in your area
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.slug}
              onClick={() => {
                setServiceType(cat.searchTerm);
                setSubmittedServiceType(cat.searchTerm);
                setSubmittedLocation(location);
                fetchProviders(cat.searchTerm, location);
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group flex flex-col items-center justify-center p-6 border border-gray-300 rounded-2xl bg-white hover:border-blue-600 hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                {cat.icon}
              </div>

              <span className="mt-3 text-gray-800 group-hover:text-blue-600 font-medium transition text-center">
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="container mx-auto px-4 mt-16">
        <h2 className="text-4xl font-bold mb-2 text-gray-900 text-center">
          Popular household services
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Find trusted local professionals for the jobs homeowners search for most
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POPULAR_SERVICES.map((p, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setServiceType(p.searchTerm);
                setSubmittedServiceType(p.searchTerm);
                setSubmittedLocation(location);
                fetchProviders(p.searchTerm, location);
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden text-left hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <img
                src={p.img}
                alt={p.title}
                className="w-full h-48 object-cover"
              />

              <div className="p-5">
                <p className="font-semibold text-lg text-gray-900">{p.title}</p>
                <p className="text-gray-500 mt-1">{p.subtitle}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <section className="mt-16 bg-gray-100 py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-700">
          <div>
            <h3 className="font-bold mb-4">Home Services</h3>
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
              <li className="hover:text-blue-600 cursor-pointer transition">For Businesses</li>
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