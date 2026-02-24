import { extractLetterboxdWatchedTitles } from "@/lib/server/letterboxd-import"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a Letterboxd ZIP export file." }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { error: "The selected file must be a .zip export." },
        { status: 400 }
      )
    }

    const titles = await extractLetterboxdWatchedTitles(await file.arrayBuffer())

    return NextResponse.json({ titles })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import that file."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
