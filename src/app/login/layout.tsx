import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Zivara',
  description: 'Sign in to your Zivara account.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
