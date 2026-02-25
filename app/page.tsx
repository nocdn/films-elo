"use client"

import { Popover } from "@base-ui-components/react/popover"
import { ArrowRight, Download, Loader, Table2, Upload, X } from "lucide-react"
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
  const [showLetterboxdInstructions, setShowLetterboxdInstructions] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

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
    setShowLetterboxdInstructions(false)
    reset()
  }

  const handleLetterboxdOptionClick = () => {
    setImportError(null)
    setImportSummary(null)
    setIsImportOpen(false)
    setShowLetterboxdInstructions(true)
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
      setShowLetterboxdInstructions(false)
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
    <div className="flex h-svh min-h-0 flex-col gap-4 overflow-hidden px-1 pt-4 pb-2 md:mx-0 md:mt-40 md:h-auto md:overflow-visible md:px-0 md:pt-0 md:pb-0">
      {showLetterboxdInstructions ? (
        <div className="border-shadow flex min-h-0 w-[min(90vw,42rem)] flex-1 flex-col overflow-y-auto rounded-4xl p-5 [corner-shape:squircle] md:min-h-96 md:flex-none md:overflow-visible">
          <div className="flex items-start justify-between">
            <h2 className="font-inter flex items-center gap-2 text-lg font-medium">
              <LetterboxdLogo
                className="size-6 shrink-0 rounded-full ring ring-gray-200/50"
                aria-hidden="true"
              />
              Instructions <span className="text-gray-500/70">({isMobile ? "mobile" : "web"})</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowLetterboxdInstructions(false)}
              className="border-shadow text-secondary-foreground flex cursor-pointer items-center justify-center rounded-4xl bg-[#FEFEFE] px-3 py-1.5 text-sm transition-all duration-50 active:scale-97"
            >
              Close
            </button>
          </div>

          {isMobile ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium">On iOS/Android:</h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-gray-700">
                <li>Open the App</li>
                <li>Go to your profile tab</li>
                <li>Press the settings cog (top left)</li>
                <li>Scroll down to "Advanced Settings"</li>
                <li>Scroll down to "Account Data"</li>
                <li>Press "Export Your Data"</li>
              </ol>
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="text-sm font-medium">On Web:</h3>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-gray-700">
                <li>Hover on your profile</li>
                <li>Open "Settings" from the menu</li>
                <li>Go to the "Data" tab</li>
                <li>Press "Export Your Data"</li>
              </ol>
            </div>
          )}

          <button
            type="button"
            onClick={() => importFileInputRef.current?.click()}
            disabled={isImporting}
            className="border-shadow text-secondary-foreground mt-auto flex cursor-pointer items-center justify-center gap-2.5 self-start rounded-4xl bg-[#FEFEFE] py-2 pr-4 pl-4 text-sm transition-all duration-50 not-disabled:active:scale-97 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImporting ? (
              <>
                Importing <Loader size={13} className="animate-spin" />
              </>
            ) : (
              <>
                Upload .zip file <Upload size={13} />
              </>
            )}
          </button>
        </div>
      ) : (
        <textarea
          className="border-shadow h-auto min-h-0 w-[min(90vw,42rem)] flex-1 overflow-y-auto rounded-4xl p-4 [corner-shape:squircle] focus:outline-none md:min-h-96 md:flex-none md:overflow-visible"
          placeholder={`Enter films to compare (one per line), for example:
          
The Godfather
Rye Lane
Snowden

Or import a Letterboxd export file.`}
          value={filmInput}
          onChange={(e) => setFilmInput(e.target.value)}
          disabled={isStarting || isImporting}
        />
      )}
      <div className="flex w-[min(90vw,42rem)] shrink-0 flex-wrap items-center gap-2">
        {hasExistingSession ? (
          <Link
            href="/comparisons"
            className="border-shadow flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#202020] py-2 pr-4 pl-5 text-[15px] text-white transition-all duration-50 active:scale-97 md:text-base"
          >
            Continue <ArrowRight size={16} strokeWidth={2.25} />
          </Link>
        ) : (
          <button
            onMouseDown={handleStart}
            disabled={isStarting || isImporting || filmInput.trim().length === 0}
            className="border-shadow flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#202020] py-2 pr-4 pl-5 text-[15px] text-white transition-all duration-50 not-disabled:active:scale-97 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
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
          className="border-shadow text-secondary-foreground flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3 pl-4 text-[15px] transition-all duration-50 not-disabled:active:scale-97 disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
        >
          Clear <X size={16} />
        </button>
        {canShowResults ? (
          <Link
            href="/results"
            className="border-shadow text-secondary-foreground flex cursor-pointer items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3.5 pl-4 text-[15px] transition-all duration-50 active:scale-97 md:text-base"
          >
            Results <Table2 size={16} />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="border-shadow text-secondary-foreground flex cursor-not-allowed items-center justify-center gap-2 rounded-4xl bg-[#FEFEFE] py-2 pr-3.5 pl-4 text-[15px] opacity-50 md:text-base"
          >
            Results <Table2 size={16} />
          </button>
        )}
        <div className="order-last flex w-full items-center gap-3.5 md:order-none md:ml-auto md:w-auto">
          <Popover.Root open={isImportOpen} onOpenChange={setIsImportOpen}>
            <button
              type="button"
              ref={importButtonRef}
              onClick={handleImportToggle}
              disabled={isStarting || isImporting}
              className="border-shadow text-secondary-foreground flex w-fit cursor-pointer items-center justify-center gap-2.5 rounded-4xl bg-[#FEFEFE] py-2 pr-4 pl-4 text-[15px] disabled:cursor-not-allowed disabled:opacity-50 md:text-base"
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
          {hasExistingSession && (
            <div className="flex flex-col justify-center text-xs leading-tight text-gray-500 md:hidden">
              <span>{state.matchHistory.length} comparisons made</span>
              <span>{state.films.length} films</span>
            </div>
          )}
        </div>
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
        <p className="hidden text-sm text-gray-500 md:block">
          {state.matchHistory.length} comparisons made • {state.films.length} films
        </p>
      )}
    </div>
  )
}
