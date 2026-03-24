import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/ui/skip-link";
import { QueryProvider } from "@/providers/query-provider";
import { LayoutShell } from "@/components/layout/layout-shell";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Zivara - Your Online Shopping Destination",
    template: "%s | Zivara",
  },
  description: "Discover amazing products at unbeatable prices. Shop quality items with fast shipping and excellent customer service.",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Zivara',
    title: 'Zivara - Your Online Shopping Destination',
    description: 'Discover amazing products at unbeatable prices. Shop quality items with fast shipping and excellent customer service.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zivara - Your Online Shopping Destination',
    description: 'Discover amazing products at unbeatable prices.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <SkipLink />
          <LayoutShell>{children}</LayoutShell>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
