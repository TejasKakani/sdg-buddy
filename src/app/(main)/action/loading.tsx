export default function ActionLoading() {
  return (
    <div className="min-h-[40vh] p-4">
      <div className="mx-auto max-w-7xl space-y-4 animate-pulse">
        <div className="h-8 w-56 rounded bg-emerald-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-40 rounded bg-white" />
          <div className="h-40 rounded bg-white" />
        </div>
      </div>
    </div>
  );
}
