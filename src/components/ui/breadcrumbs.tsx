import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-gray-600">
        <li>
          <Link href="/" className="hover:text-black">Home</Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center space-x-2">
            <span>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-black">{item.label}</Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
