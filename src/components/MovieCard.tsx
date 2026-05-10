import Link from 'next/link'
import type { Movie } from '@/src/domain/types'
import { TypeBadge } from './TypeBadge'

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="445" viewBox="0 0 300 445"%3E%3Crect width="300" height="445" fill="%2327272a"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2371717a" font-size="16" font-family="sans-serif"%3ENo Poster%3C/text%3E%3C/svg%3E'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const poster = movie.Poster === 'N/A' ? PLACEHOLDER : movie.Poster

  return (
    <Link
      href={`/movie/${movie.imdbID}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-yellow-500/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-zinc-800">
        <img
          src={poster}
          alt={movie.Title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <TypeBadge type={movie.Type} />
        <p className="font-semibold text-white text-sm leading-tight line-clamp-2">
          {movie.Title}
        </p>
        <p className="text-zinc-400 text-xs">{movie.Year}</p>
      </div>
    </Link>
  )
}
