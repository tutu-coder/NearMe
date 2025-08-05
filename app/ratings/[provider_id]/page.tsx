'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

// Star rating input component
function StarRatingInput({ rating, onChange }: { rating: number; onChange: (val: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex space-x-1 text-3xl cursor-pointer select-none">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          className={star <= (hovered ?? rating) ? 'text-yellow-400' : 'text-gray-300'}
          aria-label={`${star} Star`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onChange(star);
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// Read-only stars for displaying saved ratings
function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex space-x-1 text-2xl select-none">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function RatingsPage() {
  const { provider_id } = useParams();
  const router = useRouter();

  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // For new review form
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch ratings for provider
  useEffect(() => {
    async function fetchRatings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('ratings')
        .select('id, rating, review, created_at, client_id, profiles!client_id(id, email)')
        .eq('provider_id', provider_id)
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch ratings.');
        setRatings([]);
      } else {
        setRatings(data || []);
        setError(null);
      }
      setLoading(false);
    }

    fetchRatings();
  }, [provider_id]);

  // Save new rating
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    // Get current user to set client_id
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to leave a review.');
      setSaving(false);
      return;
    }

    if (newRating < 1 || newRating > 5) {
      setError('Please select a rating from 1 to 5 stars.');
      setSaving(false);
      return;
    }

    if (newReview.trim().length === 0) {
      setError('Please write a review before submitting.');
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from('ratings').insert([
      {
        provider_id,
        client_id: user.id,
        rating: newRating,
        review: newReview.trim(),
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError('Failed to save your review. Please try again.');
    } else {
      setNewRating(0);
      setNewReview('');
      setSuccessMsg('Your review has been submitted successfully!');

      // Refresh ratings after save
      const { data } = await supabase
        .from('ratings')
        .select('id, rating, review, created_at, client_id, profiles!client_id(id, email)')
        .eq('provider_id', provider_id)
        .order('created_at', { ascending: false });
      setRatings(data || []);
      setError(null);
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ratings & Reviews</h1>

      <button
        onClick={() => router.push('/services')}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        ← Back to Services
      </button>

      {loading && <p>Loading ratings...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {successMsg && <p className="text-green-600 mb-4">{successMsg}</p>}

      {/* Existing Ratings */}
      {ratings.length === 0 && !loading && <p className="text-gray-600 mb-6">No ratings yet. Be the first to review!</p>}

      <div className="space-y-6 mb-10">
        {ratings.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow">
            <StarRatingDisplay rating={r.rating} />
            <p className="mt-2 text-gray-700">{r.review}</p>
            <p className="mt-1 text-xs text-gray-400">
              By: {r.profiles?.email || 'Unknown'} on {new Date(r.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Leave a Review */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>

        <label className="block mb-2 font-medium">Your Rating</label>
        <StarRatingInput rating={newRating} onChange={setNewRating} />

        <label className="block mt-4 mb-2 font-medium" htmlFor="review-textarea">
          Your Review
        </label>
        <textarea
          id="review-textarea"
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          rows={4}
          className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your review here..."
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50 transition"
        >
          {saving ? 'Saving...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}
