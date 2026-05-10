'use client'

import { useMemo } from 'react'
import { OmdbMovieRepository } from '@/src/infrastructure/OmdbMovieRepository'
import { useMovieSearch } from '@/src/application/useMovieSearch'
import { SearchBar } from '@/src/components/SearchBar'
import { MovieGrid } from '@/src/components/MovieGrid'
import { LoadingSpinner } from '@/src/components/LoadingSpinner'
import { ErrorMessage } from '@/src/components/ErrorMessage'
import { EmptyState } from '@/src/components/EmptyState'

export default function HomePage() {
  const repository = useMemo(
    () => new OmdbMovieRepository(process.env.NEXT_PUBLIC_OMDB_API_KEY!),
    []
  )
  const { results, totalResults, loading, error, hasMore, search, loadMore } =
    useMovieSearch(repository)

  const searched = results.length > 0 || error !== null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-yellow-400 text-xl font-bold tracking-tight shrink-0">
              🎬 CineSearch
            </span>
            <div className="flex-1">
              <SearchBar onSearch={search} loading={loading} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!searched && !loading && <EmptyState />}

        {loading && results.length === 0 && <LoadingSpinner />}

        {error && <ErrorMessage message={error} />}

        {results.length > 0 && (
          <>
            <p className="text-zinc-500 text-sm mb-6">
              {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''} found
            </p>
            <MovieGrid movies={results} />

            {loading && <LoadingSpinner />}

            {!loading && hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  className="rounded-lg border border-zinc-700 px-8 py-3 text-zinc-300 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
