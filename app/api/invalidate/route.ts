import { revalidateTag } from "next/cache"

export async function POST() {
  revalidateTag("tmdb", { expire: 0 })
  return Response.json({ revalidated: true })
}
