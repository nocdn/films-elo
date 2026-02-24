export interface Film {
  id: string
  name: string
  year?: number
  posterUrl?: string
  elo: number
  comparisons: number
}

export interface MatchResult {
  winnerId: string
  loserId: string
  winnerPrevElo: number
  loserPrevElo: number
  timestamp: number
}

export interface FilmRankingState {
  films: Film[]
  matchHistory: MatchResult[]
  totalComparisonsNeeded: number
  version: number
  lastComparison?: {
    filmAId: string
    filmBId: string
  }
}

export const INITIAL_ELO = 1400
export const K_FACTOR = 32
export const STORAGE_KEY = "film-ranking-state"
