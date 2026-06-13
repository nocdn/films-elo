## Films-Elo

A tool to help you rank the films you've seen.

You can first add films (or import them from Letterboxd) and then compare them to each other, to create an elo-like ranking of which are your favourites.

#### Supports Importing from:

- Letterboxd (added)
- TMDB (coming soon)
- IMDB (coming soon)
- Trakt (coming soon)

#### Environment Variables:

| Variable | Required | Description |
| --- | --- | --- |
| `TMDB_API_KEY` | Yes | TMDB API key used for fetching film posters. Get one from your TMDB account API settings. |

#### Deploying:

This is a Next.js app so deploy it however you like.
Just remember to set the `TMDB_API_KEY` environment variable.
