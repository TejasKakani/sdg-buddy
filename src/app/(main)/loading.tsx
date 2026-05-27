export default function MainLoading() {
  return (
    <div className="min-h-screen bg-emerald-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
        <div className="h-10 w-72 rounded bg-emerald-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-24 rounded bg-white" />
          <div className="h-24 rounded bg-white" />
          <div className="h-24 rounded bg-white" />
        </div>
        <div className="h-64 rounded bg-white" />
      </div>
    </div>
  );
}
