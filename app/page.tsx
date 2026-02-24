"use client"

import { Popover } from "@base-ui-components/react/popover"
import { ArrowRight, Download, Loader, Table2, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react"
import { LetterboxdLogo } from "../lib/components/letterboxd-logo"
import { useFilmRanking } from "../lib/hooks/use-film-ranking"

type ImportResponse = {
  titles?: string[]
  error?: string
}

export default function Home() {
  const router = useRouter()
  const { state, isLoading, startNewRanking, reset } = useFilmRanking()
  const [filmInput, setFilmInput] = useState("")
  const [isStarting, setIsStarting] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSummary, setImportSummary] = useState<string | null>(null)
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const importButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (state && state.films.length > 0 && !isLoading) {
      const names = state.films.map((f) => f.name).join("\n")
      setFilmInput(names)
    }
  }, [state, isLoading])

  const handleStart = async () => {
    const films = filmInput
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (films.length < 2) return

    setIsStarting(true)
    await startNewRanking(films)
    router.push("/comparisons")
  }

  const handleClear = () => {
    setFilmInput("")
    setImportError(null)
    setImportSummary(null)
    reset()
  }

  const handleLetterboxdOptionClick = () => {
    setImportError(null)
    setImportSummary(null)
    setIsImportOpen(false)
    importFileInputRef.current?.click()
  }

  const handleImportToggle = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (isStarting || isImporting) return

    setIsImportOpen((open) => !open)
  }

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setImportError("Select a Letterboxd ZIP export file.")
      event.target.value = ""
      return
    }

    setImportError(null)
    setImportSummary(null)
    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/import/letterboxd", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as ImportResponse

      if (!response.ok || !Array.isArray(data.titles)) {
        throw new Error(data.error || "Could not import that Letterboxd export.")
      }

      if (data.titles.length < 2) {
        throw new Error("Import must contain at least 2 films.")
      }

      reset()
      setFilmInput(data.titles.join("\n"))
      setImportSummary(`Imported ${data.titles.length} films from Letterboxd.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not import that file."
      setImportError(message)
    } finally {
      setIsImporting(false)
      event.target.value = ""
    }
  }

  const hasExistingSession = state && state.films.length > 0
  const canShowResults = hasExistingSession && state.matchHistory.length > 0

  return (
    <div className="mt-40 flex flex-col gap-4">
      <textarea
        className="border-shadow min-h-96 w-2xl rounded-4xl p-4 [corner-shape:squircle] focus:outline-none"
        placeholder="Enter films to compare (one per line)"
        value={filmInput}
        onChange={(e) => setFilmInput(e.target.value)}
        disabled={isStarting || isImporting}
      />
      <div className="flex gap-2">
        {hasExistingSession ? (
          <Link
            href="/comparisons"
            className="border-shadow flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#202020] py-2 pr-4 pl-5 text-white transition-all duration-50 active:scale-97"
          >
            Continue <ArrowRight size={16} strokeWidth={2.25} />
          </Link>
        ) : (
          <button
            onMouseDown={handleStart}
            disabled={isStarting || isImporting || filmInput.trim().length === 0}
            className="border-shadow flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#202020] py-2 pr-4 pl-5 text-white transition-all duration-50 not-disabled:active:scale-97 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting ? (
              <>
                Loading <Loader size={16} className="animate-spin" />
              </>
            ) : (
              <>
                Start <ArrowRight size={16} strokeWidth={2.25} />
              </>
            )}
          </button>
        )}
        <button
          onMouseDown={handleClear}
          disabled={isStarting || isImporting}
          className="border-shadow text-secondary-foreground flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3 pl-4 transition-all duration-50 not-disabled:active:scale-97 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear <X size={16} />
        </button>
        {canShowResults ? (
          <Link
            href="/results"
            className="border-shadow text-secondary-foreground flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3.5 pl-4 transition-all duration-50 active:scale-97"
          >
            Results <Table2 size={16} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="border-shadow text-secondary-foreground flex cursor-not-allowed items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3.5 pl-4 opacity-50"
          >
            Results <Table2 size={16} />
          </button>
        )}
        <Popover.Root open={isImportOpen} onOpenChange={setIsImportOpen}>
          <button
            type="button"
            ref={importButtonRef}
            onMouseDown={handleImportToggle}
            disabled={isStarting || isImporting}
            className="border-shadow text-secondary-foreground ml-auto flex cursor-pointer items-center justify-center gap-2.5 rounded-4xl bg-[#FEFEFE] py-2 pr-4 pl-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImporting ? (
              <>
                Importing <Loader size={15} className="animate-spin" />
              </>
            ) : (
              <>
                Import <Download size={15} />
              </>
            )}
          </button>
          <Popover.Portal>
            <Popover.Positioner anchor={importButtonRef} align="end" sideOffset={8}>
              <Popover.Popup className="border-shadow rounded-full bg-[#FEFEFE] p-1">
                <button
                  type="button"
                  onClick={handleLetterboxdOptionClick}
                  className="text-secondary-foreground flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm hover:bg-black/5"
                >
                  <LetterboxdLogo className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Letterboxd
                </button>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
        <input
          ref={importFileInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={handleImportFileChange}
        />
      </div>
      {importError && <p className="text-sm text-red-500">{importError}</p>}
      {importSummary && <p className="ml-0.5 text-sm text-gray-500">{importSummary}</p>}
      {hasExistingSession && (
        <p className="text-sm text-gray-500">
          {state.matchHistory.length} comparisons made • {state.films.length} films
        </p>
      )}
    </div>
  )
}
