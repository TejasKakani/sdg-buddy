"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error", error.message);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">
              Please try again. If the problem continues, contact support.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-5 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
