'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/new': 'New Product',
  '/admin/categories': 'Categories',
  '/admin/categories/new': 'New Category',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/reviews': 'Reviews',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

export function AdminHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 
    (pathname.includes('/edit') ? 'Edit' :
     pathname.includes('/products/') ? 'Product Details' :
     pathname.includes('/orders/') ? 'Order Details' :
     pathname.includes('/users/') ? 'User Details' :
     pathname.includes('/categories/') ? 'Category Details' :
     'Admin');

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-[1536px] px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
