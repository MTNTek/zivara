import Link from 'next/link';
import Image from 'next/image';

interface CategoryStripProps {
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const CATEGORY_ICONS: Record<string, { label: string; img: string; color: string }> = {
  electronics: {
    label: 'Electronics',
    img: 'https://placehold.co/200x200/e8f4fd/1a73e8?text=💻',
    color: '#e8f4fd',
  },
  fashion: {
    label: 'Fashion',
    img: 'https://placehold.co/200x200/fce4ec/c62828?text=👗',
    color: '#fce4ec',
  },
  'home-kitchen': {
    label: 'Home',
    img: 'https://placehold.co/200x200/e8f5e9/2e7d32?text=🏠',
    color: '#e8f5e9',
  },
  'beauty-health': {
    label: 'Beauty',
    img: 'https://placehold.co/200x200/f3e5f5/7b1fa2?text=💄',
    color: '#f3e5f5',
  },
  'sports-outdoors': {
    label: 'Sports',
    img: 'https://placehold.co/200x200/fff3e0/e65100?text=⚽',
    color: '#fff3e0',
  },
  'toys-games': {
    label: 'Toys',
    img: 'https://placehold.co/200x200/e0f7fa/00838f?text=🎮',
    color: '#e0f7fa',
  },
};

export function CategoryStrip({ categories }: CategoryStripProps) {
  const items = categories
    .filter((c) => CATEGORY_ICONS[c.slug])
    .slice(0, 6)
    .map((c) => ({
      ...CATEGORY_ICONS[c.slug],
      href: `/products?category=${c.slug}`,
      id: c.id,
    }));

  if (items.length === 0) return null;

  return (
    <div className="bg-white py-4 px-3 sm:px-6">
      <div>
        <div className="flex justify-between items-start gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-2 min-w-[72px] sm:min-w-[100px] group"
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#febd69] transition-all group-hover:shadow-md"
                style={{ backgroundColor: item.color }}
              >
                <Image
                  src={item.img}
                  alt={item.label}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs sm:text-sm text-[#0f1111] font-medium text-center leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
