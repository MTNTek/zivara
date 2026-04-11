'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'zivara-cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-4 md:right-auto md:max-w-sm animate-in slide-in-from-bottom duration-300">
      <div className="bg-blue-800 text-white rounded-t-lg md:rounded-lg shadow-2xl p-5 mx-0 md:mx-0">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">🍪</span>
          <div className="flex-1">
            <p className="text-sm leading-relaxed mb-3">
              We use cookies to improve your experience. By continuing to browse, you agree to our{' '}
              <Link href="/privacy" className="text-[#fbbf24] hover:underline">
                Privacy Policy
              </Link>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={accept}
                className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0F1111] text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={decline}
                className="bg-transparent hover:bg-white/10 text-white text-sm px-4 py-1.5 rounded-full border border-white/30 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
