import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  title: string;
  items: { name: string; imageUrl: string; href: string }[];
  seeMoreHref: string;
}

function CategoryCard({ title, items, seeMoreHref }: CategoryCardProps) {
  return (
    <div className="bg-white p-5 flex flex-col h-full">
      <h2 className="text-xl font-bold text-[#0f1111] mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {items.slice(0, 4).map((item) => (
          <Link key={item.name} href={item.href} className="group">
            <div className="relative w-full aspect-square bg-[#f7f7f7] rounded overflow-hidden mb-1">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 40vw, 150px"
                unoptimized
              />
            </div>
            <p className="text-xs text-[#0f1111] leading-tight line-clamp-2">
              {item.name}
            </p>
          </Link>
        ))}
      </div>
      <Link
        href={seeMoreHref}
        className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline mt-4"
      >
        See more
      </Link>
    </div>
  );
}

interface CategoryCardsGridProps {
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const CATEGORY_IMAGES: Record<string, { items: { name: string; img: string; href: string }[] }> = {
  electronics: {
    items: [
      { name: 'Smartphones', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop', href: '/products/category/smartphones' },
      { name: 'Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop', href: '/products/category/laptops-computers' },
      { name: 'Headphones', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', href: '/products/category/audio-headphones' },
      { name: 'Cameras', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop', href: '/products/category/cameras-photography' },
    ],
  },
  'mens-fashion': {
    items: [
      { name: 'Clothing', img: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop', href: '/products/category/mens-clothing' },
      { name: 'Shoes', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop', href: '/products/category/mens-shoes' },
      { name: 'Watches', img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&h=300&fit=crop', href: '/products/category/mens-watches' },
      { name: 'Accessories', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop', href: '/products/category/mens-accessories' },
    ],
  },
  'womens-fashion': {
    items: [
      { name: 'Dresses', img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=300&fit=crop', href: '/products/category/womens-dresses' },
      { name: 'Shoes', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop', href: '/products/category/womens-shoes' },
      { name: 'Bags', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop', href: '/products/category/womens-bags' },
      { name: 'Jewelry', img: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=300&h=300&fit=crop', href: '/products/category/womens-jewelry' },
    ],
  },
  'home-kitchen': {
    items: [
      { name: 'Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', href: '/products/category/kitchen-dining' },
      { name: 'Furniture', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop', href: '/products/category/furniture' },
      { name: 'Bedding', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=300&fit=crop', href: '/products/category/bedding-bath' },
      { name: 'Decor', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&h=300&fit=crop', href: '/products/category/home-decor-lighting' },
    ],
  },
  'beauty-health': {
    items: [
      { name: 'Skincare', img: 'https://images.unsplash.com/photo-1570194065650-d99fb4a38691?w=300&h=300&fit=crop', href: '/products/category/skincare' },
      { name: 'Makeup', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop', href: '/products/category/makeup' },
      { name: 'Hair Care', img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300&h=300&fit=crop', href: '/products/category/hair-care' },
      { name: 'Fragrances', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop', href: '/products/category/fragrances' },
    ],
  },
  'sports-outdoors': {
    items: [
      { name: 'Fitness', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop', href: '/products/category/exercise-fitness' },
      { name: 'Outdoor', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&h=300&fit=crop', href: '/products/category/outdoor-recreation' },
      { name: 'Team Sports', img: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=300&h=300&fit=crop', href: '/products/category/team-sports' },
      { name: 'Cycling', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=300&fit=crop', href: '/products/category/sports-outdoors' },
    ],
  },
  books: {
    items: [
      { name: 'Fiction', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop', href: '/products/category/books' },
      { name: 'Non-Fiction', img: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=300&h=300&fit=crop', href: '/products/category/books' },
      { name: 'Bestsellers', img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=300&fit=crop', href: '/products/category/books' },
      { name: 'New Releases', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop', href: '/products/category/books' },
    ],
  },
  'toys-games': {
    items: [
      { name: 'Board Games', img: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=300&h=300&fit=crop', href: '/products/category/toys-games' },
      { name: 'Building Toys', img: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300&h=300&fit=crop', href: '/products/category/toys-games' },
      { name: 'Educational', img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop', href: '/products/category/toys-games' },
      { name: 'Action Figures', img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&h=300&fit=crop', href: '/products/category/toys-games' },
    ],
  },
  'pet-supplies': {
    items: [
      { name: 'Dog Supplies', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop', href: '/products/category/pet-supplies' },
      { name: 'Cat Supplies', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop', href: '/products/category/pet-supplies' },
      { name: 'Pet Food', img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop', href: '/products/category/pet-supplies' },
      { name: 'Pet Toys', img: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=300&h=300&fit=crop', href: '/products/category/pet-supplies' },
    ],
  },
};

export function CategoryCardsGrid({ categories }: CategoryCardsGridProps) {
  const displayCategories = categories
    .filter((c) => CATEGORY_IMAGES[c.slug])
    .slice(0, 4);

  return (
    <>
      {displayCategories.map((cat) => {
        const data = CATEGORY_IMAGES[cat.slug];
        return (
          <CategoryCard
            key={cat.id}
            title={cat.name}
            items={data.items.map((item) => ({
              name: item.name,
              imageUrl: item.img,
              href: item.href,
            }))}
            seeMoreHref={`/products/category/${cat.slug}`}
          />
        );
      })}
    </>
  );
}
