"use client"

import { Popover } from "@base-ui-components/react/popover"
import { ArrowLeft, Film as FilmIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFilmRanking } from "../../lib/hooks/use-film-ranking"

export default function Results() {
  const router = useRouter()
  const { state, isLoading, sortedFilms, completionPercentage, totalMatches } = useFilmRanking()
  const [copied, setCopied] = useState(false)

  const handleExport = async () => {
    const text = sortedFilms.map((film) => film.name).join("\n")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    if (!isLoading && (!state || state.films.length === 0)) {
      router.push("/")
    }
  }, [isLoading, state, router])

  if (isLoading || !state) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  const rankDigits = String(sortedFilms.length).length

  return (
    <div className="pb-10">
      <Link href="/" prefetch={true} className="absolute top-4 left-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <Popover.Root>
        <Popover.Trigger
          openOnHover
          delay={0}
          closeDelay={0}
          onMouseDown={handleExport}
          className="absolute top-4 right-5.5 flex cursor-pointer items-center gap-2"
        >
          {copied ? "Copied" : "Export"}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner align="end" sideOffset={8}>
            <Popover.Popup className="border-shadow rounded-xl bg-[#FEFEFE] px-3 py-2 text-sm text-gray-600">
              Copies as a txt list <br /> separated by new lines
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <div className="font-ioskeley-mono mt-20 flex w-3xl flex-col gap-4 border border-dashed border-gray-300 pt-4">
        <div className="font-inter flex items-center justify-between px-4 pb-2 text-sm text-gray-500">
          <span>{totalMatches} comparisons</span>
          <span>{completionPercentage}% complete</span>
        </div>
        {sortedFilms.map((film, index) => (
          <div
            key={film.id}
            className="flex items-center gap-4 border-b border-dashed border-gray-300 px-4 pb-4 tabular-nums last:border-b-0"
          >
            <div className="mr-4 text-[15px] text-gray-400 tabular-nums">
              <span className="mr-0.5">#</span>
              {String(index + 1).padStart(rankDigits, "0")}
            </div>
            {film.posterUrl ? (
              <img src={film.posterUrl} alt={film.name} className="h-14 rounded" />
            ) : (
              <div className="flex h-14 w-9 items-center justify-center rounded bg-gray-100">
                <FilmIcon className="h-5 w-5 text-gray-300" />
              </div>
            )}
            <div className="flex flex-col">
              <h2 className="font-inter">{film.name}</h2>
              <p className="text-sm text-gray-500">
                {film.year || "Unknown year"}{" "}
                <span className="text-[11px] text-gray-400/40">•</span> {film.comparisons} matches
              </p>
            </div>
            <p className="ml-auto text-sm text-gray-500">{film.elo}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex w-full justify-around gap-2">
        <Link
          href="/comparisons"
          className="border-shadow flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#202020] px-5 py-2 text-white transition-all duration-50 active:scale-97"
        >
          Continue Comparing
        </Link>
      </div>
    </div>
  )
}
