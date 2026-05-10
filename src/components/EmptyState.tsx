interface EmptyStateProps {
  query?: string
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="text-5xl">🎬</div>
      {query ? (
        <>
          <p className="text-zinc-300 font-medium">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-zinc-500 text-sm">Try a different title or check the spelling.</p>
        </>
      ) : (
        <>
          <p className="text-zinc-300 font-medium">Find your next watch</p>
          <p className="text-zinc-500 text-sm">Search for any movie or series above.</p>
        </>
      )}
    </div>
  )
}
