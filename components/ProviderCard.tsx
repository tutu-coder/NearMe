import Link from 'next/link';

export default function ProviderCard({ provider, onEmail }: any) {
  return (
    <div className="group bg-card border rounded-2xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all">
      <img
        src={provider.profile_image || '/placeholder.png'}
        className="h-40 w-full object-cover rounded-xl mb-4"
      />

      <h3 className="font-bold text-lg">{provider.business_name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {provider.description}
      </p>

      <div className="mt-4 space-y-2">
        {provider.phone_number && (
          <a
            href={`https://wa.me/${provider.phone_number}`}
            target="_blank"
            className="block text-center bg-green-500 text-white py-2 rounded"
          >
            WhatsApp
          </a>
        )}

        <button
          onClick={onEmail}
          className="w-full bg-primary text-white py-2 rounded"
        >
          Email
        </button>

        <Link
          href={`/ratings/${provider.id}`}
          className="block text-center bg-yellow-500 text-white py-2 rounded"
        >
          Ratings
        </Link>
      </div>
    </div>
  );
}
