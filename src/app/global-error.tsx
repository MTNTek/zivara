'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#EAEDED',
          padding: '1rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem', background: 'white', borderRadius: '8px', padding: '2.5rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0F1111', marginBottom: '0.5rem' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#565959', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
              We encountered an unexpected error. Please try again or return to the homepage.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#0F1111',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '9999px',
                  border: '1px solid #D5D9D9',
                  background: 'white',
                  color: '#0F1111',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Go to Homepage
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
