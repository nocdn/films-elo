"use client"

import { ArrowLeft, Film as FilmIcon, Table2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { useFilmRanking } from "../../lib/hooks/use-film-ranking"
import type { Film } from "../../lib/types"

type ComparisonOptionProps = {
  film: Film
  onPick: () => void
}

function ComparisonOption({ film, onPick }: ComparisonOptionProps) {
  return (
    <button
      onMouseDown={onPick}
      className="flex w-[clamp(6.5rem,19svh,10.5rem)] cursor-pointer flex-col items-center focus:outline-none md:h-[496px] md:w-[267px]"
    >
      <div className="border-shadow aspect-[2/3] w-full overflow-hidden rounded-xl">
        {film.posterUrl ? (
          <img
            src={film.posterUrl}
            alt={film.name}
            className="border-shadow h-full w-full rounded-xl object-cover [corner-shape:squircle]"
          />
        ) : (
          <div className="border-shadow flex h-full w-full items-center justify-center rounded-xl bg-gray-100 [corner-shape:squircle]">
            <FilmIcon className="h-10 w-10 text-gray-300 md:h-16 md:w-16" />
          </div>
        )}
      </div>
      <div className="mt-1.5 h-[clamp(2rem,5svh,2.8rem)] w-full overflow-hidden px-1 md:mt-4 md:h-[80px]">
        <p className="w-full text-center text-[14px] leading-tight break-words whitespace-normal text-gray-700 md:text-base">
          {film.name}
          {film.year && <span className="ml-1 text-gray-400">({film.year})</span>}
        </p>
      </div>
    </button>
  )
}

export default function Comparisons() {
  const router = useRouter()
  const {
    state,
    isLoading,
    currentPair,
    completionPercentage,
    totalMatches,
    canUndo,
    recordMatch,
    undoLastMatch,
  } = useFilmRanking()

  const handleUndo = useCallback(() => {
    undoLastMatch()
  }, [undoLastMatch])

  useEffect(() => {
    if (!isLoading && (!state || state.films.length < 2)) {
      router.push("/")
    }
  }, [isLoading, state, router])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && canUndo) {
        e.preventDefault()
        handleUndo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canUndo, handleUndo])

  const handleChoice = (winnerId: string, loserId: string) => {
    recordMatch(winnerId, loserId)
  }

  if (isLoading || !currentPair) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  const [filmA, filmB] = currentPair

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden md:h-auto md:overflow-visible">
      <div className="mt-4 flex w-full shrink-0 items-start justify-between px-4 md:mt-0 md:px-0">
        <Link
          href="/"
          prefetch={true}
          className="flex items-center gap-2 md:absolute md:top-4 md:left-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex flex-col items-end gap-1 md:absolute md:top-4 md:right-4">
          <div className="text-sm text-gray-500">{totalMatches} comparisons</div>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gray-800 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-400">{completionPercentage}% to minimum</div>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-between px-4 pt-2 pb-4 md:mt-40 md:min-h-fit md:flex-none md:justify-center md:gap-20 md:px-0 md:pt-0 md:pb-0">
        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 md:w-auto md:flex-none md:flex-row md:items-center md:justify-center md:gap-12">
          <ComparisonOption film={filmA} onPick={() => handleChoice(filmA.id, filmB.id)} />
          <p className="hidden text-sm text-gray-400/50 md:block md:text-base">vs</p>
          <ComparisonOption film={filmB} onPick={() => handleChoice(filmB.id, filmA.id)} />
        </div>
        <Link
          href="/results"
          className={`border-shadow text-secondary-foreground mt-3 flex shrink-0 items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3.5 pl-4 duration-50 md:mt-0 ${
            completionPercentage >= 100
              ? "cursor-pointer transition-all active:scale-97"
              : "cursor-not-allowed opacity-50"
          }`}
          onClick={(e) => completionPercentage < 100 && e.preventDefault()}
        >
          Results <Table2 size={16} />
        </Link>
      </div>
    </div>
  )
}
