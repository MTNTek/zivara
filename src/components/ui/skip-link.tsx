/**
 * Skip Link Component
 * Provides keyboard users a way to skip navigation and jump directly to main content
 * Meets WCAG 2.4.1 (Bypass Blocks) Level A
 */

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
