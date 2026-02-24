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
  query: string,
  apiKey: string
): Promise<{ posterUrl?: string; year?: number } | null> {
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

export async function enrichFilmsWithPosters(
  films: { name: string }[],
  apiKey: string
): Promise<Map<string, { posterUrl?: string; year?: number }>> {
  const results = new Map<string, { posterUrl?: string; year?: number }>()

  const batchSize = 5
  for (let i = 0; i < films.length; i += batchSize) {
    const batch = films.slice(i, i + batchSize)
    const promises = batch.map(async (film) => {
      const data = await searchFilm(film.name, apiKey)
      return { name: film.name, data }
    })

    const batchResults = await Promise.all(promises)
    for (const { name, data } of batchResults) {
      if (data) {
        results.set(name, data)
      }
    }

    if (i + batchSize < films.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}
