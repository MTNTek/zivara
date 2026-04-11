'use client';

import Link from 'next/link';
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
  '/admin/suppliers': 'Suppliers',
  '/admin/suppliers/new': 'New Supplier',
  '/admin/sync-jobs': 'Sync Jobs',
  '/admin/markup-rules': 'Markup Rules',
  '/admin/messages': 'Messages',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
};

const quickActions: Record<string, { label: string; href: string }> = {
  '/admin/products': { label: '+ New Product', href: '/admin/products/new' },
  '/admin/categories': { label: '+ New Category', href: '/admin/categories/new' },
  '/admin/suppliers': { label: '+ New Supplier', href: '/admin/suppliers/new' },
};

export function AdminHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 
    (pathname.includes('/edit') ? 'Edit' :
     pathname.includes('/products/') ? 'Product Details' :
     pathname.includes('/orders/') ? 'Order Details' :
     pathname.includes('/users/') ? 'User Details' :
     pathname.includes('/categories/') ? 'Category Details' :
     pathname.includes('/suppliers/') ? 'Supplier Details' :
     'Admin');

  const action = quickActions[pathname];

  // Build breadcrumb segments
  const segments = pathname.replace('/admin/', '').split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = '/admin/' + segments.slice(0, i + 1).join('/');
    const label = pageTitles[href] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    return { label, href, isLast: i === segments.length - 1 };
  });

  return (
    <header className="bg-white shadow-sm print:hidden">
      <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <nav className="mb-1" aria-label="Admin breadcrumb">
            <ol className="flex items-center gap-1 text-xs text-gray-500">
              <li>
                <Link href="/admin/dashboard" className="hover:text-gray-700">Admin</Link>
              </li>
              {breadcrumbs.map((crumb) => (
                <li key={crumb.href} className="flex items-center gap-1">
                  <span>/</span>
                  {crumb.isLast ? (
                    <span className="text-gray-700 font-medium">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-gray-700">{crumb.label}</Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {action && (
            <Link
              href={action.href}
              className="bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
            >
              {action.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
