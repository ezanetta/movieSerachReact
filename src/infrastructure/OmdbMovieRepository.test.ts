import { OmdbMovieRepository } from './OmdbMovieRepository'

const API_KEY = 'test-key'

function makeFetch(body: unknown, ok = true, status = 200): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('OmdbMovieRepository', () => {
  let repo: OmdbMovieRepository

  beforeEach(() => {
    repo = new OmdbMovieRepository(API_KEY)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('searchMovies', () => {
    it('returns mapped movies on success', async () => {
      global.fetch = makeFetch({
        Response: 'True',
        totalResults: '2',
        Search: [
          { imdbID: 'tt0000001', Title: 'Movie A', Year: '2000', Type: 'movie', Poster: 'N/A' },
          { imdbID: 'tt0000002', Title: 'Series B', Year: '2010', Type: 'series', Poster: 'http://img.example.com/b.jpg' },
        ],
      })

      const result = await repo.searchMovies('test', 1)

      expect(result.totalResults).toBe(2)
      expect(result.movies).toHaveLength(2)
      expect(result.movies[0]).toEqual({
        imdbID: 'tt0000001',
        Title: 'Movie A',
        Year: '2000',
        Type: 'movie',
        Poster: 'N/A',
      })
    })

    it('includes the page param in the URL', async () => {
      global.fetch = makeFetch({
        Response: 'True',
        totalResults: '10',
        Search: [],
      })

      await repo.searchMovies('inception', 3)

      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
      expect(url).toContain('page=3')
      expect(url).toContain(`apikey=${API_KEY}`)
    })

    it('throws when OMDb returns Response: False', async () => {
      global.fetch = makeFetch({ Response: 'False', Error: 'Movie not found!' })

      await expect(repo.searchMovies('xyznotareal', 1)).rejects.toThrow('Movie not found!')
    })

    it('throws on HTTP error', async () => {
      global.fetch = makeFetch(null, false, 500)

      await expect(repo.searchMovies('test', 1)).rejects.toThrow('HTTP error 500')
    })
  })

  describe('getMovieById', () => {
    const detailResponse = {
      Response: 'True',
      imdbID: 'tt0468569',
      Title: 'The Dark Knight',
      Year: '2008',
      Rated: 'PG-13',
      Genre: 'Action, Crime, Drama',
      Director: 'Christopher Nolan',
      Actors: 'Christian Bale, Heath Ledger',
      Plot: 'Batman must accept one of the greatest psychological...',
      imdbRating: '9.0',
      Runtime: '152 min',
      Awards: 'Won 2 Oscars',
      Poster: 'http://img.example.com/dk.jpg',
      Type: 'movie',
    }

    it('returns full movie detail on success', async () => {
      global.fetch = makeFetch(detailResponse)

      const movie = await repo.getMovieById('tt0468569')

      expect(movie.imdbID).toBe('tt0468569')
      expect(movie.Title).toBe('The Dark Knight')
      expect(movie.Director).toBe('Christopher Nolan')
      expect(movie.imdbRating).toBe('9.0')
    })

    it('includes imdbID and plot=full in the URL', async () => {
      global.fetch = makeFetch(detailResponse)

      await repo.getMovieById('tt0468569')

      const url = (global.fetch as jest.Mock).mock.calls[0][0] as string
      expect(url).toContain('i=tt0468569')
      expect(url).toContain('plot=full')
    })

    it('throws when movie is not found', async () => {
      global.fetch = makeFetch({ Response: 'False', Error: 'Incorrect IMDb ID.' })

      await expect(repo.getMovieById('ttBAD')).rejects.toThrow('Incorrect IMDb ID.')
    })

    it('throws on HTTP error', async () => {
      global.fetch = makeFetch(null, false, 503)

      await expect(repo.getMovieById('tt0468569')).rejects.toThrow('HTTP error 503')
    })
  })
})
