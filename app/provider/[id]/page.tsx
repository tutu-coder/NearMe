'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [provider, setProvider] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/'); // redirect to home if not logged in
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError('Provider not found.');
      } else {
        setProvider(data);
      }

      setLoading(false);
    };

    if (id) fetchData();
  }, [id, router]);

  const handleChange = (field: string, value: string) => {
    setProvider((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('provider-images')
      .upload(filePath, file);

    if (uploadError) {
      setError('Image upload failed.');
      setUploading(false);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('provider-images')
      .getPublicUrl(filePath);

    setUploading(false);
    return publicUrlData.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    let imageUrl = provider.profile_image;

    if (logoFile) {
      const uploadedUrl = await handleImageUpload(logoFile);
      if (!uploadedUrl) {
        setSaving(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    const { error: updateError } = await supabase
      .from('providers')
      .update({
        name: provider.name,
        business_name: provider.business_name,
        business_email: provider.business_email,
        phone_number: provider.phone_number,
        description: provider.description,
        service_type: provider.service_type,
        location: provider.location,
        profile_image: imageUrl,
        keywords: provider.keywords,
      })
      .eq('id', id);

    if (updateError) {
      setError('Failed to save changes.');
    } else {
      setError(null);
    }

    setSaving(false);
    if (imageUrl) {
      setProvider((prev: any) => ({ ...prev, profile_image: imageUrl }));
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white shadow-md rounded-xl p-6 max-w-3xl w-full space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <img
            src={provider.profile_image || 'https://via.placeholder.com/150'}
            alt="Logo"
            className="w-28 h-28 rounded-full object-cover border"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="mt-3 text-sm"
          />
          {uploading && <p className="text-sm text-gray-500 mt-1">Uploading image...</p>}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-4">
          {[
            { label: 'Full Name and Surname', field: 'name' },
            { label: 'Business Name', field: 'business_name' },
            { label: 'Business Email', field: 'business_email' },
            { label: 'Phone Number', field: 'phone_number' },
            { label: 'Description', field: 'description', textarea: true },
            { label: 'Service Type', field: 'service_type' },
            { label: 'Location', field: 'location' },
            { label: 'Searchable Keywords', field: 'keywords' },
          ].map(({ label, field, textarea }) => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              {textarea ? (
                <textarea
                  value={provider[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              ) : (
                <input
                  type="text"
                  value={provider[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full mt-1 p-2 border rounded"
                />
              )}
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="text-right">
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
