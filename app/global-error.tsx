'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { boundary: 'global' } });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="mb-4 text-3xl font-bold">Something went wrong</h1>
          <p className="mb-8 text-gray-600">Please try again.</p>
          <button type="button" onClick={reset} className="rounded bg-[#19273A] px-4 py-2 text-white">Try again</button>
        </main>
      </body>
    </html>
  );
}
