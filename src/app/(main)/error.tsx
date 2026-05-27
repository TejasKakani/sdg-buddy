"use client";

import { useEffect } from "react";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Main segment error", error.message);
  }, [error]);

  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-emerald-800">Dashboard unavailable</h2>
        <p className="mt-2 text-sm text-emerald-900/80">
          We could not load your dashboard right now.
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
  );
}
