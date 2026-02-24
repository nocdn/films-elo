"use client"

import { calculateMinComparisonsNeeded } from "./elo"
import { Film, FilmRankingState, INITIAL_ELO, STORAGE_KEY } from "./types"

export function loadState(): FilmRankingState | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as FilmRankingState
    const recalculatedMinimum = calculateMinComparisonsNeeded(parsed.films.length)

    if (parsed.totalComparisonsNeeded !== recalculatedMinimum) {
      parsed.totalComparisonsNeeded = recalculatedMinimum
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    }

    return parsed
  } catch {
    return null
  }
}

export function saveState(state: FilmRankingState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error("Failed to save state:", e)
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function createFilmId(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function initializeFilms(filmNames: string[]): FilmRankingState {
  const films: Film[] = filmNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({
      id: createFilmId(name),
      name,
      elo: INITIAL_ELO,
      comparisons: 0,
    }))

  const state: FilmRankingState = {
    films,
    matchHistory: [],
    totalComparisonsNeeded: calculateMinComparisonsNeeded(films.length),
    version: 1,
  }

  saveState(state)
  return state
}
