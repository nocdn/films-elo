import { parse } from "csv-parse/sync"
import JSZip from "jszip"

type CsvRow = Record<string, string | undefined>

const WATCHED_FILE_NAME = "watched.csv"
const TITLE_COLUMN_NAME = "Name"

export async function extractLetterboxdWatchedTitles(zipBuffer: ArrayBuffer): Promise<string[]> {
  const zip = await JSZip.loadAsync(zipBuffer)

  const watchedFile = Object.values(zip.files).find(
    (entry) => !entry.dir && entry.name.toLowerCase().endsWith(WATCHED_FILE_NAME)
  )

  if (!watchedFile) {
    throw new Error("Could not find watched.csv in that ZIP export.")
  }

  const watchedCsv = await watchedFile.async("text")
  const rows = parse(watchedCsv, {
    bom: true,
    columns: true,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[]

  const titles = rows
    .map((row) => row[TITLE_COLUMN_NAME]?.trim())
    .filter((title): title is string => Boolean(title))

  if (titles.length === 0) {
    throw new Error("No movie titles were found in watched.csv.")
  }

  return titles
}
