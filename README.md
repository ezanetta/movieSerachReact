# CineSearch

A movie and series search app built with Next.js 16 and the [OMDb API](https://www.omdbapi.com/). Search for any title, browse results in a responsive grid, and open a full detail page for cast, plot, ratings, and awards.

## Features

- **Search** — type any movie or series title and get up to 10 results per page from the OMDb API
- **Pagination** — a "Load more" button appends the next page of results without losing the ones already shown
- **Movie detail** — click any card to see the full poster, plot, director, cast, IMDb rating, runtime, and awards
- **Back navigation** — the back button on the detail page returns to the search results without losing them; the query is stored in the URL so the results are restored automatically
- **Responsive layout** — works on mobile and desktop; the header stacks vertically on small screens and the card grid adjusts from 2 to 5 columns
- **Dark cinema theme** — built with Tailwind CSS, zinc/gold palette, no external UI libraries

## Getting started

### Prerequisites

- Node.js 20.9+
- An [OMDb API key](https://www.omdbapi.com/apikey.aspx) (free tier available)

### Setup

```bash
# Install dependencies
npm install

# Create the local env file and add your API key
echo "NEXT_PUBLIC_OMDB_API_KEY=your_key_here" > .env.local

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running tests

```bash
npm test          # run all tests once
npm run test:watch  # watch mode
```

## Architecture

The codebase follows a **Clean Architecture** pattern with four layers. Each layer only depends on the layer below it — never the other way around.

```
src/
├── domain/          # Layer 1 — pure types and interfaces
├── infrastructure/  # Layer 2 — external API integration
├── application/     # Layer 3 — business logic (custom hooks)
└── components/      # Layer 4 — presentational React components
app/                 # Next.js App Router pages
```

### Layer 1 — Domain (`src/domain/`)

Pure TypeScript types and interfaces with no framework dependencies. This is the innermost layer; everything else depends on it, but it depends on nothing.

| File | Purpose |
|---|---|
| `types.ts` | `Movie`, `MovieDetail`, `SearchResult` interfaces matching the OMDb response shape |
| `repository.ts` | `MovieRepository` interface — the data contract for the rest of the app |

```ts
interface MovieRepository {
  searchMovies(query: string, page: number): Promise<SearchResult>
  getMovieById(imdbID: string): Promise<MovieDetail>
}
```

### Layer 2 — Infrastructure (`src/infrastructure/`)

Concrete implementation of `MovieRepository` that talks to the OMDb REST API using the built-in `fetch`. All network concerns (URLs, response mapping, error handling) are isolated here — no `fetch` calls exist anywhere else in the codebase.

`OmdbMovieRepository` maps the raw OMDb JSON shape into domain types and converts `{ Response: "False", Error: "..." }` responses into thrown errors so the rest of the app never has to inspect raw API payloads.

### Layer 3 — Application (`src/application/`)

Custom React hooks that contain all business logic. They receive a `MovieRepository` via parameter (dependency injection) which keeps them decoupled from the API and trivially testable with a mock repository.

| Hook | Responsibilities |
|---|---|
| `useMovieSearch` | manages query, pagination, results, loading, and error state; exposes `search` and `loadMore` actions |
| `useMovieDetail` | fetches a single movie by IMDb ID; cancels stale in-flight requests when the ID changes |

```ts
// Example: pages instantiate the real repository and inject it
const repository = new OmdbMovieRepository(process.env.NEXT_PUBLIC_OMDB_API_KEY!)
const { results, loading, error, hasMore, search, loadMore } = useMovieSearch(repository)
```

### Layer 4 — Presentation (`src/components/` and `app/`)

React components are purely presentational — they receive data and callbacks as props and have no knowledge of the API or repository. Pages are the only place where the repository is instantiated and passed down to the hooks.

| Component | Purpose |
|---|---|
| `SearchBar` | controlled input form; emits `onSearch` on submit |
| `MovieCard` / `MovieGrid` | responsive card grid with poster, title, year, type badge |
| `MovieDetailView` | full detail layout with poster, plot, ratings, metadata |
| `LoadingSpinner` / `ErrorMessage` / `EmptyState` | feedback states |
| `TypeBadge` | colour-coded pill for movie / series / episode |

#### URL as state

The active search query is stored in the URL as `/?q={query}`. Submitting a search pushes a new URL entry; a `useEffect` watching the query param re-runs the search whenever the URL changes. This means `router.back()` on the detail page restores the exact URL, which automatically re-fetches and re-displays the previous results.

## Unit tests

Tests live alongside their source files (`*.test.ts`) and are run with Jest and React Testing Library.

### What is tested

**`OmdbMovieRepository.test.ts`** — infrastructure layer
- Happy path: successful search returns correctly mapped domain objects
- URL construction: page number and API key are included in the request
- OMDb error response (`Response: "False"`): error message is thrown
- HTTP error (non-2xx status): error with status code is thrown
- Same cases repeated for `getMovieById`

**`useMovieSearch.test.ts`** — application layer
- Initial state is empty with no loading
- Loading transitions: true while fetching, false on completion
- Successful search populates `results` and `totalResults`
- Repository error is surfaced in `error` state
- Blank query is a no-op (repository is never called)
- `loadMore` appends the next page and advances the page counter
- `hasMore` is false when all results are loaded

**`useMovieDetail.test.ts`** — application layer
- Starts in loading state (`loading: true`, `movie: null`)
- Resolves to the full movie object on success
- Repository error is surfaced in `error` state
- Re-fetches when `imdbID` prop changes
- Stale responses are discarded when `imdbID` changes before the first request resolves (cancellation via cleanup flag)

### Testing approach

- **Dependency injection makes hooks testable**: hooks receive the repository as a parameter, so tests pass a `jest.fn()` mock object — no network calls, no environment variables required
- **`renderHook` + `act`** from React Testing Library for hook tests
- **`jest.fn()` on `global.fetch`** for repository tests — no HTTP interception library needed
- No snapshot tests: assertions target specific behaviour (state values, call arguments) rather than rendered output

## Engineering practices

- **TypeScript strict mode** — `"strict": true` in `tsconfig.json`; no `any` types anywhere
- **Clean Architecture** — dependency rule enforced by convention: domain ← infrastructure ← application ← presentation
- **Dependency injection** — hooks receive the repository as a parameter, making them independently testable and swappable
- **No raw `fetch` outside the infrastructure layer** — all API URLs and response mapping are in `OmdbMovieRepository`
- **Stale request cancellation** — `useMovieDetail` uses a `cancelled` flag in the `useEffect` cleanup to discard responses that arrive after the component has navigated away or the ID has changed
- **Stable callbacks** — `useMovieSearch` uses `useRef` for mutable pagination state (query, page) to avoid stale closures in `useCallback` without adding those values as dependencies
- **URL-driven state** — search state lives in the URL, not only in React memory, so it survives navigation and supports browser back/forward naturally
