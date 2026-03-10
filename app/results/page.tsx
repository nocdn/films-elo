"use client"

import { Popover } from "@base-ui-components/react/popover"
import { ArrowLeft, Film as FilmIcon, Loader } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useFilmRanking } from "../../lib/hooks/use-film-ranking"

export default function Results() {
  const router = useRouter()
  const { state, isLoading, sortedFilms, completionPercentage, totalMatches, importFromCsv } =
    useFilmRanking()
  const [copied, setCopied] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isExportHover, setIsExportHover] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const exportButtonRef = useRef<HTMLButtonElement>(null)

  const handleExportToggle = () => {
    setIsExportOpen((open) => !open)
  }

  const handleCopyPlainText = async () => {
    const text = sortedFilms.map((film) => film.name).join("\n")
    await navigator.clipboard.writeText(text)
    setIsExportOpen(false)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownloadCsv = () => {
    const header = "title,elo"
    const rows = sortedFilms.map((film) => `${film.name},${film.elo}`)
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "film-rankings.csv"
    a.click()
    URL.revokeObjectURL(url)
    setIsExportOpen(false)
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      await importFromCsv(text)
    } catch (e) {
      console.error("Failed to import CSV:", e)
    } finally {
      setIsImporting(false)
      event.target.value = ""
    }
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
      <div className="absolute top-4 right-5.5 flex items-center gap-4">
        <Popover.Root>
          <Popover.Trigger
            openOnHover
            delay={0}
            closeDelay={0}
            render={
              <button
                type="button"
                onClick={() => importFileInputRef.current?.click()}
                disabled={isImporting}
                className="flex cursor-pointer items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              />
            }
          >
            {isImporting ? (
              <>
                Importing <Loader size={14} className="animate-spin" />
              </>
            ) : (
              <>Import</>
            )}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner align="end" sideOffset={8}>
              <Popover.Popup className="border-shadow rounded-xl bg-[#FEFEFE] px-3 py-2 text-sm text-gray-600">
                Import a results CSV file
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
        <input
          ref={importFileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleImportFile}
        />
        <Popover.Root
          open={isExportHover && !isExportOpen}
          onOpenChange={setIsExportHover}
        >
          <Popover.Trigger
            openOnHover
            delay={0}
            closeDelay={0}
            render={
              <button
                type="button"
                ref={exportButtonRef}
                onClick={handleExportToggle}
                className="flex cursor-pointer items-center gap-1.5"
              />
            }
          >
            {copied ? "Copied" : "Export"}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner align="end" sideOffset={8}>
              <Popover.Popup className="border-shadow rounded-xl bg-[#FEFEFE] px-3 py-2 text-sm text-gray-600">
                Copy or download your results
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
        <Popover.Root open={isExportOpen} onOpenChange={setIsExportOpen}>
          <Popover.Portal>
            <Popover.Positioner anchor={exportButtonRef} align="end" sideOffset={8}>
              <Popover.Popup className="border-shadow rounded-xl bg-[#FEFEFE] p-1">
                <button
                  type="button"
                  onClick={handleCopyPlainText}
                  className="text-secondary-foreground flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-black/5"
                >
                  Plain text
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="text-secondary-foreground flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-black/5"
                >
                  CSV file
                </button>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
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
          className="border-shadow mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#202020] px-5 py-2 text-white transition-all duration-50 active:scale-97"
        >
          Continue Comparing
        </Link>
      </div>
    </div>
  )
}
