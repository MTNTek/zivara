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
            <div className="relative w-full aspect-square bg-gray-50 rounded overflow-hidden mb-1">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 40vw, 150px"
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

const CATEGORY_IMAGES: Record<string, { items: { name: string; img: string }[] }> = {
  electronics: {
    items: [
      { name: 'Smartphones', img: 'https://placehold.co/300x300/f0f0f0/333?text=Smartphones' },
      { name: 'Laptops', img: 'https://placehold.co/300x300/f0f0f0/333?text=Laptops' },
      { name: 'Headphones', img: 'https://placehold.co/300x300/f0f0f0/333?text=Headphones' },
      { name: 'Cameras', img: 'https://placehold.co/300x300/f0f0f0/333?text=Cameras' },
    ],
  },
  fashion: {
    items: [
      { name: "Men's Clothing", img: 'https://placehold.co/300x300/f0f0f0/333?text=Mens' },
      { name: "Women's Clothing", img: 'https://placehold.co/300x300/f0f0f0/333?text=Womens' },
      { name: 'Shoes', img: 'https://placehold.co/300x300/f0f0f0/333?text=Shoes' },
      { name: 'Accessories', img: 'https://placehold.co/300x300/f0f0f0/333?text=Accessories' },
    ],
  },
  'home-kitchen': {
    items: [
      { name: 'Kitchen', img: 'https://placehold.co/300x300/f0f0f0/333?text=Kitchen' },
      { name: 'Furniture', img: 'https://placehold.co/300x300/f0f0f0/333?text=Furniture' },
      { name: 'Bedding', img: 'https://placehold.co/300x300/f0f0f0/333?text=Bedding' },
      { name: 'Decor', img: 'https://placehold.co/300x300/f0f0f0/333?text=Decor' },
    ],
  },
  'beauty-health': {
    items: [
      { name: 'Skincare', img: 'https://placehold.co/300x300/f0f0f0/333?text=Skincare' },
      { name: 'Makeup', img: 'https://placehold.co/300x300/f0f0f0/333?text=Makeup' },
      { name: 'Haircare', img: 'https://placehold.co/300x300/f0f0f0/333?text=Haircare' },
      { name: 'Fragrances', img: 'https://placehold.co/300x300/f0f0f0/333?text=Fragrances' },
    ],
  },
  'sports-outdoors': {
    items: [
      { name: 'Fitness', img: 'https://placehold.co/300x300/f0f0f0/333?text=Fitness' },
      { name: 'Outdoor', img: 'https://placehold.co/300x300/f0f0f0/333?text=Outdoor' },
      { name: 'Cycling', img: 'https://placehold.co/300x300/f0f0f0/333?text=Cycling' },
      { name: 'Camping', img: 'https://placehold.co/300x300/f0f0f0/333?text=Camping' },
    ],
  },
  books: {
    items: [
      { name: 'Fiction', img: 'https://placehold.co/300x300/f0f0f0/333?text=Fiction' },
      { name: 'Non-Fiction', img: 'https://placehold.co/300x300/f0f0f0/333?text=Non-Fiction' },
      { name: 'Bestsellers', img: 'https://placehold.co/300x300/f0f0f0/333?text=Bestsellers' },
      { name: 'New Releases', img: 'https://placehold.co/300x300/f0f0f0/333?text=New+Releases' },
    ],
  },
  'toys-games': {
    items: [
      { name: 'Board Games', img: 'https://placehold.co/300x300/f0f0f0/333?text=Board+Games' },
      { name: 'Building Toys', img: 'https://placehold.co/300x300/f0f0f0/333?text=Building' },
      { name: 'Educational', img: 'https://placehold.co/300x300/f0f0f0/333?text=Educational' },
      { name: 'Action Figures', img: 'https://placehold.co/300x300/f0f0f0/333?text=Action' },
    ],
  },
  'pet-supplies': {
    items: [
      { name: 'Dog Supplies', img: 'https://placehold.co/300x300/f0f0f0/333?text=Dogs' },
      { name: 'Cat Supplies', img: 'https://placehold.co/300x300/f0f0f0/333?text=Cats' },
      { name: 'Pet Food', img: 'https://placehold.co/300x300/f0f0f0/333?text=Pet+Food' },
      { name: 'Pet Toys', img: 'https://placehold.co/300x300/f0f0f0/333?text=Pet+Toys' },
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
              href: `/products?categoryId=${cat.id}`,
            }))}
            seeMoreHref={`/products?categoryId=${cat.id}`}
          />
        );
      })}
    </>
  );
}
