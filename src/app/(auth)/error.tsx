"use client";

import { useEffect } from "react";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth segment error", error.message);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-gray-900/60 p-6 text-center">
        <h2 className="text-xl font-semibold">Authentication error</h2>
        <p className="mt-2 text-sm text-gray-300">Please retry your request.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-400"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
