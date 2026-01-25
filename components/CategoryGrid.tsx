'use client';

type Category = {
  name: string;
  icon: string;
};

const categories: Category[] = [
  { name: 'Plumbers', icon: '🔧' },
  { name: 'Electricians', icon: '💡' },
  { name: 'Painters', icon: '🎨' },
  { name: 'Gardeners', icon: '🌿' },
  { name: 'Cleaners', icon: '🧼' },
  { name: 'Mechanics', icon: '🚗' },
];

type CategoryGridProps = {
  onSelect: (category: string) => void;
};

export default function CategoryGrid({ onSelect }: CategoryGridProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">
          Browse by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onSelect(cat.name)}
              className="group p-6 bg-card border rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="text-3xl mb-2">
                {cat.icon}
              </div>
              <p className="font-medium group-hover:text-primary">
                {cat.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
