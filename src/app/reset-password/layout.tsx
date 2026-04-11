import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Zivara',
  description: 'Reset your Zivara account password.',
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
