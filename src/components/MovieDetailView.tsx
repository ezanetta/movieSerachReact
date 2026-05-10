'use client'

import Link from 'next/link'
import type { MovieDetail } from '@/src/domain/types'
import { TypeBadge } from './TypeBadge'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="445" viewBox="0 0 300 445"%3E%3Crect width="300" height="445" fill="%2327272a"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2371717a" font-size="16" font-family="sans-serif"%3ENo Poster%3C/text%3E%3C/svg%3E'

interface MovieDetailViewProps {
  movie: MovieDetail | null
  loading: boolean
  error: string | null
}

export function MovieDetailView({ movie, loading, error }: MovieDetailViewProps) {
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!movie) return null

  const poster = movie.Poster === 'N/A' ? PLACEHOLDER : movie.Poster

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-400 transition-colors mb-8 text-sm"
      >
        ← Back to search
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <img
            src={poster}
            alt={movie.Title}
            className="w-full rounded-xl shadow-2xl"
          />
        </div>

        <div className="flex flex-col gap-5 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <TypeBadge type={movie.Type} />
            {movie.Rated && movie.Rated !== 'N/A' && (
              <span className="bg-zinc-800 text-zinc-300 text-xs font-semibold px-2 py-0.5 rounded border border-zinc-700">
                {movie.Rated}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight">{movie.Title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
            <span>{movie.Year}</span>
            {movie.Runtime !== 'N/A' && <span>{movie.Runtime}</span>}
            {movie.Genre !== 'N/A' && <span>{movie.Genre}</span>}
          </div>

          {movie.imdbRating !== 'N/A' && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="text-yellow-400 font-bold text-lg">{movie.imdbRating}</span>
              <span className="text-zinc-500 text-sm">/ 10 IMDb</span>
            </div>
          )}

          {movie.Plot !== 'N/A' && (
            <p className="text-zinc-300 leading-relaxed">{movie.Plot}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {movie.Director !== 'N/A' && (
              <Detail label="Director" value={movie.Director} />
            )}
            {movie.Actors !== 'N/A' && (
              <Detail label="Cast" value={movie.Actors} />
            )}
            {movie.Awards !== 'N/A' && (
              <Detail label="Awards" value={movie.Awards} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-zinc-300 text-sm">{value}</dd>
    </div>
  )
}
