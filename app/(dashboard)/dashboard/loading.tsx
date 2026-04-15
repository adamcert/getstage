export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-zinc-900 animate-pulse" />
        <div className="h-9 w-80 rounded bg-zinc-900 animate-pulse" />
        <div className="h-4 w-48 rounded bg-zinc-900 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
            <div className="mt-3 h-8 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
      </div>
    </div>
  );
}
