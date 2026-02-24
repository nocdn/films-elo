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
      className="flex h-[496px] w-[267px] cursor-pointer flex-col items-center focus:outline-none"
    >
      <div className="border-shadow h-[400px] w-[267px] overflow-hidden rounded-xl">
        {film.posterUrl ? (
          <img
            src={film.posterUrl}
            alt={film.name}
            className="border-shadow h-full w-full rounded-xl object-cover [corner-shape:squircle]"
          />
        ) : (
          <div className="border-shadow flex h-full w-full items-center justify-center rounded-xl bg-gray-100 [corner-shape:squircle]">
            <FilmIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>
      <div className="mt-4 h-[80px] w-[267px] overflow-hidden px-1">
        <p className="w-full text-center text-base leading-tight break-words whitespace-normal text-gray-700">
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
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  const [filmA, filmB] = currentPair

  return (
    <>
      <Link href="/" prefetch={true} className="absolute top-4 left-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <div className="text-sm text-gray-500">{totalMatches} comparisons</div>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-800 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-400">{completionPercentage}% to minimum</div>
      </div>
      <div className="mt-40 flex flex-col items-center justify-center gap-20">
        <div className="flex items-center gap-12">
          <ComparisonOption film={filmA} onPick={() => handleChoice(filmA.id, filmB.id)} />
          <p className="text-gray-400/50">vs</p>
          <ComparisonOption film={filmB} onPick={() => handleChoice(filmB.id, filmA.id)} />
        </div>
        <Link
          href="/results"
          className={`border-shadow text-secondary-foreground flex items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3.5 pl-4 duration-50 ${
            completionPercentage >= 100
              ? "cursor-pointer transition-all active:scale-97"
              : "cursor-not-allowed opacity-50"
          }`}
          onClick={(e) => completionPercentage < 100 && e.preventDefault()}
        >
          Results <Table2 size={16} />
        </Link>
      </div>
    </>
  )
}
