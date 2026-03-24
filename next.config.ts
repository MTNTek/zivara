import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses
  compress: true,

  // Strict powered-by header removal
  poweredByHeader: false,

  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logos.hunter.io',
        pathname: '/**',
      },
      // S3 / CDN bucket — add your production image host here
      ...(process.env.CDN_HOSTNAME
        ? [{ protocol: 'https' as const, hostname: process.env.CDN_HOSTNAME, pathname: '/**' }]
        : []),
    ],
  },

  async headers() {
    const cdnHost = process.env.CDN_HOSTNAME;
    const imgSrc = [
      "'self'",
      "data:",
      "blob:",
      "https://placehold.co",
      "https://images.unsplash.com",
      "https://logos.hunter.io",
      ...(cdnHost ? [`https://${cdnHost}`] : []),
    ].join(' ');

    return [
      // Cache static assets aggressively
      {
        source: '/logo.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              `img-src ${imgSrc}`,
              "font-src 'self'",
              "frame-src https://js.stripe.com",
              "connect-src 'self' https://api.stripe.com https://api.resend.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
