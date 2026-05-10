export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-12 h-12 rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />
      <p className="text-zinc-400">Loading…</p>
    </div>
  )
}
