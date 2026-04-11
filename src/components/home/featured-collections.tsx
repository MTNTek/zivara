import Link from 'next/link';
import Image from 'next/image';

const collections = [
  {
    title: 'New Season Essentials',
    subtitle: 'Curated picks for spring',
    href: '/new-arrivals',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop',
    span: 'col-span-2 row-span-2',
    aspect: 'aspect-[8/5]',
  },
  {
    title: 'Tech Deals',
    subtitle: 'Save on top electronics',
    href: '/products/category/electronics',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop',
    span: 'col-span-1',
    aspect: 'aspect-[4/3]',
  },
  {
    title: 'Home Refresh',
    subtitle: 'Decor & furniture finds',
    href: '/products/category/home-kitchen',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop',
    span: 'col-span-1',
    aspect: 'aspect-[4/3]',
  },
];

export function FeaturedCollections() {
  return (
    <div className="bg-white p-5">
      <h2 className="text-[21px] font-bold text-[#0f1111] mb-4">Featured Collections</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-auto">
        {collections.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`group relative rounded-lg overflow-hidden ${item.span} ${item.aspect}`}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={item.span.includes('2') ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
              <p className="text-sm text-white/80 mt-0.5">{item.subtitle}</p>
              <span className="inline-block mt-2 text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full group-hover:bg-white/30 transition-colors">
                Shop now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
