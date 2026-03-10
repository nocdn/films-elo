"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { enrichFilms } from "@/app/actions"
import { calculateNewRatings, getCompletionPercentage, selectNextPair } from "../elo"
import { clearState, initializeFilms, loadState, saveState } from "../storage"
import { Film, FilmRankingState } from "../types"

export function useFilmRanking() {
  const [state, setState] = useState<FilmRankingState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPair, setCurrentPair] = useState<[Film, Film] | null>(null)
  const [lastPair, setLastPair] = useState<[Film, Film] | null>(null)
  const skipNextPairSelectionRef = useRef(false)

  useEffect(() => {
    const loaded = loadState()
    setState(loaded)
    if (loaded && loaded.lastComparison) {
      const filmA = loaded.films.find((f) => f.id === loaded.lastComparison!.filmAId)
      const filmB = loaded.films.find((f) => f.id === loaded.lastComparison!.filmBId)
      if (filmA && filmB) {
        setLastPair([filmA, filmB])
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (skipNextPairSelectionRef.current) {
      skipNextPairSelectionRef.current = false
      return
    }
    if (state && state.films.length >= 2) {
      const pair = selectNextPair(state.films)
      setCurrentPair(pair)
    } else {
      setCurrentPair(null)
    }
  }, [state])

  const startNewRanking = useCallback(async (filmNames: string[]) => {
    setIsLoading(true)
    const newState = initializeFilms(filmNames)

    try {
      const posterData = await enrichFilms(filmNames)
      newState.films = newState.films.map((film) => {
        const data = posterData[film.name]
        if (data) {
          return { ...film, posterUrl: data.posterUrl, year: data.year }
        }
        return film
      })
      saveState(newState)
    } catch (e) {
      console.error("Failed to fetch posters:", e)
    }

    setState(newState)
    setIsLoading(false)
    return newState
  }, [])

  const recordMatch = useCallback(
    (winnerId: string, loserId: string) => {
      if (!state || !currentPair) return

      const winner = state.films.find((f) => f.id === winnerId)
      const loser = state.films.find((f) => f.id === loserId)
      if (!winner || !loser) return

      setLastPair(currentPair)

      const { winnerNewElo, loserNewElo } = calculateNewRatings(winner, loser)

      const updatedFilms = state.films.map((f) => {
        if (f.id === winnerId) {
          return { ...f, elo: winnerNewElo, comparisons: f.comparisons + 1 }
        }
        if (f.id === loserId) {
          return { ...f, elo: loserNewElo, comparisons: f.comparisons + 1 }
        }
        return f
      })

      const newState: FilmRankingState = {
        ...state,
        films: updatedFilms,
        matchHistory: [
          ...state.matchHistory,
          {
            winnerId,
            loserId,
            winnerPrevElo: winner.elo,
            loserPrevElo: loser.elo,
            timestamp: Date.now(),
          },
        ],
        lastComparison: {
          filmAId: currentPair[0].id,
          filmBId: currentPair[1].id,
        },
      }

      saveState(newState)
      setState(newState)
    },
    [state, currentPair]
  )

  const undoLastMatch = useCallback(() => {
    if (!state || state.matchHistory.length === 0 || !lastPair) return false

    const lastMatch = state.matchHistory[state.matchHistory.length - 1]

    const updatedFilms = state.films.map((f) => {
      if (f.id === lastMatch.winnerId) {
        return { ...f, elo: lastMatch.winnerPrevElo, comparisons: f.comparisons - 1 }
      }
      if (f.id === lastMatch.loserId) {
        return { ...f, elo: lastMatch.loserPrevElo, comparisons: f.comparisons - 1 }
      }
      return f
    })

    const newState: FilmRankingState = {
      ...state,
      films: updatedFilms,
      matchHistory: state.matchHistory.slice(0, -1),
      lastComparison: undefined,
    }

    saveState(newState)
    skipNextPairSelectionRef.current = true
    setCurrentPair(lastPair)
    setLastPair(null)
    setState(newState)
    return true
  }, [state, lastPair])

  const importFromCsv = useCallback(
    async (csvText: string) => {
      const lines = csvText.trim().split("\n")
      if (lines.length < 2) return // header + at least 1 film

      const films: Film[] = lines.slice(1).map((line) => {
        const lastComma = line.lastIndexOf(",")
        const name = line.slice(0, lastComma).trim()
        const elo = parseInt(line.slice(lastComma + 1).trim(), 10)
        return {
          id: `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name,
          elo: isNaN(elo) ? 1400 : elo,
          comparisons: 0,
        }
      })

      if (films.length < 2) return

      const newState: FilmRankingState = {
        films,
        matchHistory: [],
        totalComparisonsNeeded: films.length,
        version: 1,
      }

      try {
        const { enrichFilms } = await import("@/app/actions")
        const posterData = await enrichFilms(films.map((f) => f.name))
        newState.films = newState.films.map((film) => {
          const data = posterData[film.name]
          if (data) {
            return { ...film, posterUrl: data.posterUrl, year: data.year }
          }
          return film
        })
      } catch (e) {
        console.error("Failed to fetch posters:", e)
      }

      saveState(newState)
      setState(newState)
      setCurrentPair(null)
      setLastPair(null)
    },
    []
  )

  const skipPair = useCallback(() => {
    if (!state || state.films.length < 2) return
    const pair = selectNextPair(state.films)
    setCurrentPair(pair)
  }, [state])

  const reset = useCallback(() => {
    clearState()
    setState(null)
    setCurrentPair(null)
    setLastPair(null)
  }, [])

  const completionPercentage = state
    ? getCompletionPercentage(state.films, state.totalComparisonsNeeded)
    : 0

  const sortedFilms = state ? [...state.films].sort((a, b) => b.elo - a.elo) : []

  const totalMatches = state ? state.matchHistory.length : 0

  return {
    state,
    isLoading,
    currentPair,
    completionPercentage,
    sortedFilms,
    totalMatches,
    canUndo: !!lastPair,
    startNewRanking,
    recordMatch,
    undoLastMatch,
    skipPair,
    importFromCsv,
    reset,
  }
}
