'use client'

import { useState, useEffect } from 'react'
import type { MovieDetail } from '@/src/domain/types'
import type { MovieRepository } from '@/src/domain/repository'

export interface UseMovieDetailReturn {
  movie: MovieDetail | null
  loading: boolean
  error: string | null
}

export function useMovieDetail(
  repository: MovieRepository,
  imdbID: string
): UseMovieDetailReturn {
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)
    setMovie(null)

    repository
      .getMovieById(imdbID)
      .then((data) => {
        if (!cancelled) {
          setMovie(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load movie')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [repository, imdbID])

  return { movie, loading, error }
}
