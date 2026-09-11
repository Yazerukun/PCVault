import type { Game } from './gameTypes'

const base = import.meta.env.BASE_URL

function asset(p?: string): string | undefined {
  if (!p) return undefined
  return p.startsWith('/') ? base + p.slice(1) : p
}

function hydrate(raw: Game[]): Game[] {
  return raw.map((g) => ({
    ...g,
    cover: asset(g.cover),
    wallpaper: asset(g.wallpaper),
    screenshots: g.screenshots?.map((s) => asset(s) ?? ''),
  }))
}

let cache: Game[] | null = null
let inflight: Promise<Game[]> | null = null

export async function loadGames(): Promise<Game[]> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = (async () => {
    try {
      const url = base + 'games.json'
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`games.json ${res.status}`)
      cache = hydrate((await res.json()) as Game[])
    } catch {
      // Runtime fetch failed (offline / stale deploy): fall back to the
      // bundled copy so the catalog still renders.
      cache = hydrate(((await import('./games.json')) as { default: Game[] }).default)
    }
    return cache!
  })()
  try {
    return await inflight
  } finally {
    inflight = null
  }
}

export function allGenres(gamesList: Game[]): string[] {
  const set = new Set<string>()
  for (const g of gamesList) for (const genre of g.genres) set.add(genre)
  return Array.from(set).sort()
}