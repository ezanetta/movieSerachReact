const badgeStyles: Record<string, string> = {
  movie: 'bg-red-900 text-red-300',
  series: 'bg-blue-900 text-blue-300',
  episode: 'bg-purple-900 text-purple-300',
}

interface TypeBadgeProps {
  type: string
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const style = badgeStyles[type] ?? 'bg-zinc-700 text-zinc-300'
  return (
    <span className={`${style} text-xs font-semibold px-2 py-0.5 rounded capitalize`}>
      {type}
    </span>
  )
}
