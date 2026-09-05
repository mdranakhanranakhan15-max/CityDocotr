'use client';

// Global error boundary.
//
// When an error is thrown inside the ROOT LAYOUT tree (e.g. providers rendered in
// app/layout.tsx such as <AuthProvider> / <AuthModal>), the regular app/error.tsx
// boundary can NOT catch it — only this global-error.tsx can, and Next.js requires it
// to render its own <html>/<body> tags because the root layout has been replaced.
// Without this file Next.js dev shows: "missing required error components, refreshing...".

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            margin: 0,
            background: '#f8fbff',
            color: '#0f172a',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 24,
              padding: 32,
              boxShadow: '0 20px 40px -20px rgba(2, 6, 23, 0.25)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                margin: '0 auto 16px',
                borderRadius: 16,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              ⚠️
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>
              Something went wrong!
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b', wordBreak: 'break-word' }}>
              {error?.message || 'A critical application error occurred.'}
              {error?.digest ? ` (Ref: ${error.digest})` : ''}
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
