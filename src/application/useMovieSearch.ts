'use client'

import { useState, useCallback, useRef } from 'react'
import type { Movie } from '@/src/domain/types'
import type { MovieRepository } from '@/src/domain/repository'

export interface UseMovieSearchReturn {
  results: Movie[]
  totalResults: number
  loading: boolean
  error: string | null
  hasMore: boolean
  search: (query: string) => Promise<void>
  loadMore: () => Promise<void>
}

export function useMovieSearch(repository: MovieRepository): UseMovieSearchReturn {
  const [results, setResults] = useState<Movie[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const queryRef = useRef('')
  const pageRef = useRef(1)

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) return

      queryRef.current = query
      pageRef.current = 1
      setLoading(true)
      setError(null)
      setResults([])
      setTotalResults(0)

      try {
        const data = await repository.searchMovies(query, 1)
        setResults(data.movies)
        setTotalResults(data.totalResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    },
    [repository]
  )

  const loadMore = useCallback(async () => {
    const nextPage = pageRef.current + 1
    setLoading(true)
    setError(null)

    try {
      const data = await repository.searchMovies(queryRef.current, nextPage)
      pageRef.current = nextPage
      setResults((prev) => [...prev, ...data.movies])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setLoading(false)
    }
  }, [repository])

  const hasMore = results.length > 0 && results.length < totalResults

  return { results, totalResults, loading, error, hasMore, search, loadMore }
}
