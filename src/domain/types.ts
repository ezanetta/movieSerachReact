export interface Movie {
  imdbID: string
  Title: string
  Year: string
  Type: 'movie' | 'series' | 'episode'
  Poster: string
}

export interface MovieDetail {
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
}

export interface SearchResult {
  movies: Movie[]
  totalResults: number
}
