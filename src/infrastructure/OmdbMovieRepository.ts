import type { MovieRepository } from '@/src/domain/repository'
import type { Movie, MovieDetail, SearchResult } from '@/src/domain/types'

interface OmdbSearchItem {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

interface OmdbSearchResponse {
  Search?: OmdbSearchItem[]
  totalResults?: string
  Response: 'True' | 'False'
  Error?: string
}

interface OmdbDetailResponse {
  imdbID: string
  Title: string
  Year: string
  Rated: string
  Genre: string
  Director: string
  Actors: string
  Plot: string
  imdbRating: string
  Runtime: string
  Awards: string
  Poster: string
  Type: string
  Response: 'True' | 'False'
  Error?: string
}

export class OmdbMovieRepository implements MovieRepository {
  private readonly baseUrl = 'https://www.omdbapi.com'

  constructor(private readonly apiKey: string) {}

  async searchMovies(query: string, page: number): Promise<SearchResult> {
    const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}&page=${page}&apikey=${this.apiKey}`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`)
    }

    const data: OmdbSearchResponse = await res.json()

    if (data.Response === 'False') {
      throw new Error(data.Error ?? 'Search failed')
    }

    return {
      movies: (data.Search ?? []).map(
        (item): Movie => ({
          imdbID: item.imdbID,
          Title: item.Title,
          Year: item.Year,
          Type: item.Type as Movie['Type'],
          Poster: item.Poster,
        })
      ),
      totalResults: parseInt(data.totalResults ?? '0', 10),
    }
  }

  async getMovieById(imdbID: string): Promise<MovieDetail> {
    const url = `${this.baseUrl}/?i=${encodeURIComponent(imdbID)}&plot=full&apikey=${this.apiKey}`
    const res = await fetch(url)

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`)
    }

    const data: OmdbDetailResponse = await res.json()

    if (data.Response === 'False') {
      throw new Error(data.Error ?? 'Movie not found')
    }

    return {
      imdbID: data.imdbID,
      Title: data.Title,
      Year: data.Year,
      Rated: data.Rated,
      Genre: data.Genre,
      Director: data.Director,
      Actors: data.Actors,
      Plot: data.Plot,
      imdbRating: data.imdbRating,
      Runtime: data.Runtime,
      Awards: data.Awards,
      Poster: data.Poster,
      Type: data.Type,
    }
  }
}
