export default function AuthLoading() {
  return (
    <main className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-gray-900/60 p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
        <div className="mt-4 space-y-3">
          <div className="h-11 animate-pulse rounded bg-gray-800" />
          <div className="h-11 animate-pulse rounded bg-gray-800" />
          <div className="h-11 animate-pulse rounded bg-gray-800" />
        </div>
      </div>
    </main>
  );
}
