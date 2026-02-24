const TMDB_API_BASE = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342"

interface TMDBSearchResult {
  id: number
  title: string
  poster_path: string | null
  release_date?: string
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[]
}

export async function searchFilm(
  query: string
): Promise<{ posterUrl?: string; year?: number } | null> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return null

  try {
    const url = `${TMDB_API_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=1`
    const response = await fetch(url)
    if (!response.ok) return null

    const data: TMDBSearchResponse = await response.json()
    if (data.results.length === 0) return null

    const movie = data.results[0]
    return {
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : undefined,
      year: movie.release_date ? parseInt(movie.release_date.split("-")[0], 10) : undefined,
    }
  } catch {
    return null
  }
}
