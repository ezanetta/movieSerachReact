'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { OmdbMovieRepository } from '@/src/infrastructure/OmdbMovieRepository'
import { useMovieDetail } from '@/src/application/useMovieDetail'
import { MovieDetailView } from '@/src/components/MovieDetailView'

export default function MovieDetailPage() {
  const params = useParams()
  const imdbID = params.imdbID as string

  const repository = useMemo(
    () => new OmdbMovieRepository(process.env.NEXT_PUBLIC_OMDB_API_KEY!),
    []
  )
  const { movie, loading, error } = useMovieDetail(repository, imdbID)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="max-w-7xl mx-auto px-4 py-10">
        <MovieDetailView movie={movie} loading={loading} error={error} />
      </main>
    </div>
  )
}
