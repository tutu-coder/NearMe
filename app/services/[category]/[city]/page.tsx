'use client';

import { supabase } from "../../../../lib/supabaseClient";
import { useState, useEffect, use } from "react";
import { Star, Phone, Mail, MessageCircle, MapPin } from "lucide-react";

const UNCLAIMED_OWNER_ID = "895572fd-cd63-4344-aea7-e43259a15ef9";

export default function CityPage({
  params,
}: {
  params: Promise<{ category: string; city: string }>;
}) {
  const { category: rawCategory, city: rawCity } = use(params);

  const category = rawCategory.toLowerCase();
  const city = rawCity.toLowerCase();

  const [providers, setProviders] = useState<any[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimProvider, setClaimProvider] = useState<any>(null);
  const [claimForm, setClaimForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [suburbFilter, setSuburbFilter] = useState("");
  const [minRating, setMinRating] = useState(0);

  const trackLead = async (providerId: string, type: string) => {
  try {
    await supabase.from("provider_leads").insert({
      provider_id: providerId,
      lead_type: type,
    });
  } catch (error) {
    console.error("Lead tracking error:", error);
  }
};
  const prettyCategory = category.replace(/-/g, " ");
  const prettyCity = city.replace(/-/g, " ");

  const toTitleCase = (text: string) =>
    text.replace(/\b\w/g, (char) => char.toUpperCase());

  const generateHeroMessage = () => {
    const niceCategory = toTitleCase(prettyCategory);
    const niceCity = toTitleCase(prettyCity);

    if (suburbFilter) {
      return `Top-rated ${niceCategory} in ${toTitleCase(suburbFilter)}, ${niceCity} – trusted by locals`;
    }

    const templates = [
      `Looking for trusted ${niceCategory} in ${niceCity}?`,
      `Top-rated ${niceCategory} in ${niceCity} – hire today!`,
      `Find the best ${niceCategory} in ${niceCity} for your home or office`,
      `Trusted ${niceCategory} in ${niceCity}, recommended by locals`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  };

  const fetchProviders = async () => {
    setLoading(true);

    let query = supabase
      .from("providers")
      .select("*")
      .or(`service_type.ilike.%${category}%,keywords.ilike.%${category}%`)
      .ilike("location", `%${city}%`);

    if (suburbFilter) {
      query = query.ilike("location", `%${suburbFilter}%`);
    }

    if (minRating > 0) {
      query = query.gte("average_rating", minRating);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      setProviders([]);
    } else {
      setProviders(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, [category, city, suburbFilter, minRating]);

  const handleClaimSubmit = async (e: any) => {
    e.preventDefault();
    if (!claimProvider) return;

    await supabase.from("provider_claim_requests").insert({
      provider_id: claimProvider.id,
      name: claimForm.name,
      email: claimForm.email,
      phone: claimForm.phone,
      message: claimForm.message,
      status: "pending",
    });

    alert("Claim request submitted.");
    setShowClaimModal(false);
    setClaimForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 mt-10">
      <h1 className="text-4xl font-bold mb-2 capitalize">
        {toTitleCase(prettyCategory)} in {toTitleCase(prettyCity)}
      </h1>
      <p className="text-xl text-gray-600 mb-6">{generateHeroMessage()}</p>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder={`Filter by suburb/area in ${toTitleCase(prettyCity)}`}
          value={suburbFilter}
          onChange={(e) => setSuburbFilter(e.target.value)}
          className="border p-2 rounded w-60"
        />

        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="border p-2 rounded w-40"
        >
          <option value={0}>All ratings</option>
          <option value={1}>1 star & up</option>
          <option value={2}>2 stars & up</option>
          <option value={3}>3 stars & up</option>
          <option value={4}>4 stars & up</option>
          <option value={5}>5 stars only</option>
        </select>
      </div>

      {/* Providers */}
      {loading ? (
        <p className="text-gray-500">Loading providers...</p>
      ) : providers.length === 0 ? (
        <p className="text-gray-500">
          No {prettyCategory} found in {toTitleCase(prettyCity)}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => {
            const isUnclaimed = provider.user_id === UNCLAIMED_OWNER_ID;

            return (
              <div
                key={provider.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={provider.profile_image || "/placeholder.png"}
                    alt={provider.business_name}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />

                  <h3 className="font-bold text-lg">{provider.business_name}</h3>
                  <p className="text-gray-500">{provider.service_type}</p>
                  <p className="text-gray-500">{provider.location}</p>

                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-700 font-medium">
                      {provider.average_rating
                        ? provider.average_rating.toFixed(1)
                        : "New"}
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

                  <div className="text-gray-600 text-sm mt-2">
                    <p
                      className={`${expandedDescriptions[provider.id] ? "" : "line-clamp-2"}`}
                      dangerouslySetInnerHTML={{
                        __html: (provider.description || "No description provided").replace(
                          /(https?:\/\/[^\s]+)/g,
                          '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>'
                        ),
                      }}
                    />
                    {provider.description && provider.description.length > 120 && (
                      <button
                        onClick={() =>
                          setExpandedDescriptions((prev) => ({
                            ...prev,
                            [provider.id]: !prev[provider.id],
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
    <a
      onClick={() => trackLead(provider.id, "email")}
      href={`mailto:${provider.business_email}`}
      className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm transition"
    >
      <Mail className="w-4 h-4" /> Email
    </a>
  )}

  <a
    href={`/ratings/${provider.id}`}
    className="flex items-center gap-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full text-sm transition"
  >
    <Star className="w-4 h-4" /> Ratings
  </a>

  <a
    onClick={() => trackLead(provider.id, "maps")}
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      provider.business_name + " " + provider.location
    )}`}
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
      )}

      {/* CLAIM MODAL */}
      {showClaimModal && claimProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Claim {claimProvider.business_name}
            </h2>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={claimForm.name}
                onChange={(e) =>
                  setClaimForm({ ...claimForm, name: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="email"
                placeholder="Business Email"
                value={claimForm.email}
                onChange={(e) =>
                  setClaimForm({ ...claimForm, email: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={claimForm.phone}
                onChange={(e) =>
                  setClaimForm({ ...claimForm, phone: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <textarea
                placeholder="Tell us how you are related to this business"
                value={claimForm.message}
                onChange={(e) =>
                  setClaimForm({ ...claimForm, message: e.target.value })
                }
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

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}