import Link from 'next/link';
import Image from 'next/image';

interface PromoBannerProps {
  href: string;
  imageUrl: string;
  alt: string;
  title: string;
  subtitle?: string;
  cta: string;
  align?: 'left' | 'right';
  dark?: boolean;
}

export function PromoBanner({ href, imageUrl, alt, title, subtitle, cta, align = 'left', dark = true }: PromoBannerProps) {
  return (
    <Link href={href} className="block relative w-full h-[180px] sm:h-[220px] rounded-lg overflow-hidden group">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
        sizes="100vw"
        unoptimized
      />
      <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-r from-black/50 via-black/20 to-transparent' : 'bg-gradient-to-r from-white/70 via-white/30 to-transparent'}`} />
      <div className={`relative h-full flex items-center ${align === 'right' ? 'justify-end pr-8 sm:pr-16' : 'pl-8 sm:pl-16'}`}>
        <div>
          <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 ${dark ? 'text-white' : 'text-[#0f1111]'}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-sm sm:text-base mb-3 ${dark ? 'text-white/80' : 'text-[#565959]'}`}>
              {subtitle}
            </p>
          )}
          <span className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-[#0f1111] text-sm font-semibold px-5 py-2 rounded-sm transition-colors">
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
