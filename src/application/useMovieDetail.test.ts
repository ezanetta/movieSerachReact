import { renderHook, waitFor } from '@testing-library/react'
import { useMovieDetail } from './useMovieDetail'
import type { MovieRepository } from '@/src/domain/repository'
import type { MovieDetail } from '@/src/domain/types'

const MOVIE: MovieDetail = {
  imdbID: 'tt0468569',
  Title: 'The Dark Knight',
  Year: '2008',
  Rated: 'PG-13',
  Genre: 'Action, Crime, Drama',
  Director: 'Christopher Nolan',
  Actors: 'Christian Bale, Heath Ledger',
  Plot: 'A long plot description.',
  imdbRating: '9.0',
  Runtime: '152 min',
  Awards: 'Won 2 Oscars',
  Poster: 'http://img.example.com/dk.jpg',
  Type: 'movie',
}

function makeRepo(overrides: Partial<MovieRepository> = {}): MovieRepository {
  return {
    searchMovies: jest.fn(),
    getMovieById: jest.fn(),
    ...overrides,
  }
}

describe('useMovieDetail', () => {
  it('starts in loading state', () => {
    const repo = makeRepo({
      getMovieById: jest.fn().mockResolvedValue(MOVIE),
    })

    const { result } = renderHook(() => useMovieDetail(repo, 'tt0468569'))

    expect(result.current.loading).toBe(true)
    expect(result.current.movie).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('resolves to the movie on success', async () => {
    const repo = makeRepo({
      getMovieById: jest.fn().mockResolvedValue(MOVIE),
    })

    const { result } = renderHook(() => useMovieDetail(repo, 'tt0468569'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.movie).toEqual(MOVIE)
    expect(result.current.error).toBeNull()
  })

  it('sets error on repository failure', async () => {
    const repo = makeRepo({
      getMovieById: jest.fn().mockRejectedValue(new Error('Incorrect IMDb ID.')),
    })

    const { result } = renderHook(() => useMovieDetail(repo, 'ttBAD'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.movie).toBeNull()
    expect(result.current.error).toBe('Incorrect IMDb ID.')
  })

  it('re-fetches when imdbID changes', async () => {
    const movie2: MovieDetail = { ...MOVIE, imdbID: 'tt0000002', Title: 'Other Movie' }
    const mockGet = jest
      .fn()
      .mockResolvedValueOnce(MOVIE)
      .mockResolvedValueOnce(movie2)

    const repo = makeRepo({ getMovieById: mockGet })
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useMovieDetail(repo, id),
      { initialProps: { id: 'tt0468569' } }
    )

    await waitFor(() => expect(result.current.movie?.imdbID).toBe('tt0468569'))

    rerender({ id: 'tt0000002' })

    await waitFor(() => expect(result.current.movie?.imdbID).toBe('tt0000002'))

    expect(mockGet).toHaveBeenCalledTimes(2)
    expect(mockGet).toHaveBeenNthCalledWith(2, 'tt0000002')
  })

  it('ignores stale responses when imdbID changes rapidly', async () => {
    let resolveFirst!: (v: MovieDetail) => void
    const stalePromise = new Promise<MovieDetail>((resolve) => {
      resolveFirst = resolve
    })
    const freshMovie: MovieDetail = { ...MOVIE, imdbID: 'tt2', Title: 'Fresh Movie' }

    const mockGet = jest
      .fn()
      .mockReturnValueOnce(stalePromise)
      .mockResolvedValueOnce(freshMovie)

    const repo = makeRepo({ getMovieById: mockGet })
    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useMovieDetail(repo, id),
      { initialProps: { id: 'tt1' } }
    )

    rerender({ id: 'tt2' })
    resolveFirst(MOVIE)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.movie?.imdbID).toBe('tt2')
  })
})
