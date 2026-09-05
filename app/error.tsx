'use client';

// Route-level error boundary (nested under the root layout).
//
// Renders when an error is thrown inside a route segment, so users see a
// friendly fallback instead of the Next.js dev overlay / "missing error
// component" refresh loop. The `reset()` action re-renders the failed segment.
// (Errors inside the root layout itself are handled by app/global-error.tsx.)

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-10 text-center font-sans">
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
      <h2 className="text-xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mt-2 text-gray-600" style={{ wordBreak: 'break-word' }}>
        {error?.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}

