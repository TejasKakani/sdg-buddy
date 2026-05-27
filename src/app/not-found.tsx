import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
