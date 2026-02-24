"use server"

import { searchFilm } from "@/lib/tmdb"

export async function enrichFilms(
  filmNames: string[]
): Promise<Record<string, { posterUrl?: string; year?: number }>> {
  const results: Record<string, { posterUrl?: string; year?: number }> = {}

  const batchSize = 5
  for (let i = 0; i < filmNames.length; i += batchSize) {
    const batch = filmNames.slice(i, i + batchSize)
    const promises = batch.map(async (name) => {
      const data = await searchFilm(name)
      return { name, data }
    })

    const batchResults = await Promise.all(promises)
    for (const { name, data } of batchResults) {
      if (data) results[name] = data
    }

    if (i + batchSize < filmNames.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}
