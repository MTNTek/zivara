import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="mb-4 text-xs" aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap text-[#565959]">
        <li>
          <Link href="/" className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">Home</Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center">
            <svg className="w-3 h-3 mx-1.5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {item.href ? (
              <Link href={item.href} className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline">{item.label}</Link>
            ) : (
              <span className="text-[#0F1111]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
