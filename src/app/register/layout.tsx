import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account - Zivara',
  description: 'Create a new Zivara account to start shopping.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
