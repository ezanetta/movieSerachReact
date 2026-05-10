import { renderHook, act } from '@testing-library/react'
import { useMovieSearch } from './useMovieSearch'
import type { MovieRepository } from '@/src/domain/repository'
import type { Movie, SearchResult } from '@/src/domain/types'

function makeMovie(id: string): Movie {
  return { imdbID: id, Title: `Movie ${id}`, Year: '2000', Type: 'movie', Poster: 'N/A' }
}

function makeRepo(overrides: Partial<MovieRepository> = {}): MovieRepository {
  return {
    searchMovies: jest.fn(),
    getMovieById: jest.fn(),
    ...overrides,
  }
}

describe('useMovieSearch', () => {
  it('starts with empty state', () => {
    const repo = makeRepo()
    const { result } = renderHook(() => useMovieSearch(repo))

    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.hasMore).toBe(false)
  })

  it('sets loading true while fetching then false on success', async () => {
    const movies = [makeMovie('tt1'), makeMovie('tt2')]
    const searchResult: SearchResult = { movies, totalResults: 2 }
    const repo = makeRepo({
      searchMovies: jest.fn().mockResolvedValue(searchResult),
    })

    const { result } = renderHook(() => useMovieSearch(repo))

    let searchPromise: Promise<void>
    act(() => {
      searchPromise = result.current.search('batman')
    })

    expect(result.current.loading).toBe(true)

    await act(async () => {
      await searchPromise!
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.results).toEqual(movies)
    expect(result.current.totalResults).toBe(2)
    expect(result.current.error).toBeNull()
  })

  it('sets error on repository failure', async () => {
    const repo = makeRepo({
      searchMovies: jest.fn().mockRejectedValue(new Error('Network error')),
    })

    const { result } = renderHook(() => useMovieSearch(repo))

    await act(async () => {
      await result.current.search('bad query')
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.loading).toBe(false)
    expect(result.current.results).toEqual([])
  })

  it('shows empty results when API returns empty search', async () => {
    const repo = makeRepo({
      searchMovies: jest.fn().mockRejectedValue(new Error('Movie not found!')),
    })

    const { result } = renderHook(() => useMovieSearch(repo))

    await act(async () => {
      await result.current.search('xyzunknown')
    })

    expect(result.current.results).toEqual([])
    expect(result.current.error).toBe('Movie not found!')
  })

  it('does nothing when searching with blank query', async () => {
    const repo = makeRepo({ searchMovies: jest.fn() })
    const { result } = renderHook(() => useMovieSearch(repo))

    await act(async () => {
      await result.current.search('   ')
    })

    expect(repo.searchMovies).not.toHaveBeenCalled()
  })

  it('appends results on loadMore', async () => {
    const page1 = [makeMovie('tt1'), makeMovie('tt2')]
    const page2 = [makeMovie('tt3')]
    const mockSearch = jest
      .fn()
      .mockResolvedValueOnce({ movies: page1, totalResults: 3 })
      .mockResolvedValueOnce({ movies: page2, totalResults: 3 })

    const repo = makeRepo({ searchMovies: mockSearch })
    const { result } = renderHook(() => useMovieSearch(repo))

    await act(async () => {
      await result.current.search('batman')
    })

    expect(result.current.results).toEqual(page1)
    expect(result.current.hasMore).toBe(true)

    await act(async () => {
      await result.current.loadMore()
    })

    expect(result.current.results).toEqual([...page1, ...page2])
    expect(result.current.hasMore).toBe(false)
    expect(mockSearch).toHaveBeenCalledWith('batman', 2)
  })

  it('sets hasMore false when all results are loaded', async () => {
    const movies = [makeMovie('tt1')]
    const repo = makeRepo({
      searchMovies: jest.fn().mockResolvedValue({ movies, totalResults: 1 }),
    })

    const { result } = renderHook(() => useMovieSearch(repo))

    await act(async () => {
      await result.current.search('test')
    })

    expect(result.current.hasMore).toBe(false)
  })
})
