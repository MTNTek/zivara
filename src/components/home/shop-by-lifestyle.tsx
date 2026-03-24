import Link from 'next/link';
import Image from 'next/image';

const lifestyles = [
  {
    title: 'Work From Home',
    description: 'Desks, chairs & tech essentials',
    href: '/products/category/office-products',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop',
    color: 'from-blue-600/80 to-blue-900/80',
  },
  {
    title: 'Outdoor Adventure',
    description: 'Gear up for your next trip',
    href: '/products/category/sports-outdoors',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop',
    color: 'from-green-600/80 to-green-900/80',
  },
  {
    title: 'Self Care Sunday',
    description: 'Skincare, wellness & relaxation',
    href: '/products/category/beauty-health',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop',
    color: 'from-pink-600/80 to-purple-900/80',
  },
  {
    title: 'Game Night',
    description: 'Board games, consoles & fun',
    href: '/products/category/toys-games',
    image: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=600&h=400&fit=crop',
    color: 'from-amber-600/80 to-red-900/80',
  },
];

export function ShopByLifestyle() {
  return (
    <div className="bg-white p-5">
      <h2 className="text-[21px] font-bold text-[#0f1111] mb-4">Shop by Lifestyle</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {lifestyles.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative rounded-lg overflow-hidden aspect-[3/2]"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${item.color}`} />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-base">{item.title}</h3>
              <p className="text-xs text-white/80 mt-0.5">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
