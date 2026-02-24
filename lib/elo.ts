import { Film, K_FACTOR } from "./types"

export function calculateExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

export function calculateNewRatings(
  winner: Film,
  loser: Film
): { winnerNewElo: number; loserNewElo: number } {
  const expectedWinner = calculateExpectedScore(winner.elo, loser.elo)
  const expectedLoser = calculateExpectedScore(loser.elo, winner.elo)

  const winnerNewElo = Math.round(winner.elo + K_FACTOR * (1 - expectedWinner))
  const loserNewElo = Math.round(loser.elo + K_FACTOR * (0 - expectedLoser))

  return { winnerNewElo, loserNewElo }
}

export function selectNextPair(films: Film[]): [Film, Film] | null {
  if (films.length < 2) return null

  const sorted = [...films].sort((a, b) => a.comparisons - b.comparisons)
  const minComparisons = sorted[0].comparisons
  const underexposed = sorted.filter((f) => f.comparisons <= minComparisons + 2)

  const filmA = underexposed[Math.floor(Math.random() * underexposed.length)]

  const candidates = films.filter((f) => f.id !== filmA.id)
  candidates.sort((a, b) => {
    const diffA = Math.abs(a.elo - filmA.elo)
    const diffB = Math.abs(b.elo - filmA.elo)
    const compDiff = a.comparisons - b.comparisons
    return compDiff * 50 + diffA - diffB
  })

  const topCandidates = candidates.slice(0, Math.max(3, Math.ceil(candidates.length * 0.3)))
  const filmB = topCandidates[Math.floor(Math.random() * topCandidates.length)]

  return Math.random() > 0.5 ? [filmA, filmB] : [filmB, filmA]
}

export function calculateMinComparisonsNeeded(filmCount: number): number {
  return Math.ceil(filmCount * 1.8)
}

export function getCompletionPercentage(films: Film[], minNeeded: number): number {
  const totalComparisons = films.reduce((sum, f) => sum + f.comparisons, 0) / 2
  return Math.min(100, Math.round((totalComparisons / minNeeded) * 100))
}
