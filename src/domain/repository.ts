import type { SearchResult, MovieDetail } from './types'

export interface MovieRepository {
  searchMovies(query: string, page: number): Promise<SearchResult>
  getMovieById(imdbID: string): Promise<MovieDetail>
}
