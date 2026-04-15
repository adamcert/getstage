export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-2 border-violet-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">Chargement</p>
      </div>
    </div>
  );
}
