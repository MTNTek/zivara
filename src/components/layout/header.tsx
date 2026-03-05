'use client';

import Navbar from './Navbar';
import { SecondaryNav } from './SecondaryNav';

export function Header() {
  return (
    <header className="sticky top-0 z-50">
      <Navbar />
      <SecondaryNav />
    </header>
  );
}
