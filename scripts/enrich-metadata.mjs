// Enrich games.json with Steam appids + gameplay trailer mp4s, pulled from the
// public Steam Storefront API (no key needed):
//   1. store.steampowered.com/api/storesearch/?term=<title>  → candidate appid
//   2. store.steampowered.com/api/appdetails?appids=<id>&filters=basic,movies
//      → real movie id, then trailer = steamstatic steam/apps/<movieid>/movie_max.mp4
//      (identical format to the existing trailer fields).
//
// Throttled (1.6s between requests, Steam-friendly), resumable (skips games that
// already have both fields), low priority. `--cap N` limits work to N games
// (smoke-test). Always backs up games.json before rewriting (merge-by-id
// friendly, array order preserved).
//
//   node scripts/enrich-metadata.mjs [--cap N]
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DIR = dirname(fileURLToPath(import.meta.url))
const ROOT = join(DIR, '..')
const DATA = join(ROOT, 'src', 'data', 'games.json')

const capArg = process.argv.indexOf('--cap')
const CAP = capArg !== -1 ? Number(process.argv[capArg + 1]) : Infinity

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const games = JSON.parse(readFileSync(DATA, 'utf8'))
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
copyFileSync(DATA, join(ROOT, 'src', 'data', 'games.json.backup-' + stamp + '-enrich'))

async function steamJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'application/json' },
        signal: AbortSignal.timeout(20000),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      return await res.json()
    } catch {
      await sleep(5000 * (attempt + 1))
    }
  }
  return null
}

function cleanTitle(title) {
  return title
    .replace(/\(.*?\)/g, ' ')
    .replace(/\[.*?\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const movieUrl = (movie) => {
  const id = movie?.id ?? movie?.movie_id
  if (!id) return null
  return `https://cdn.akamai.steamstatic.com/steam/apps/${id}/movie_max.mp4`
}

let scanned = 0
let updated = 0
let missed = 0

for (const g of games) {
  if (g.appid && g.appid > 0 && g.trailer) continue
  if (scanned >= CAP) break

  const term = encodeURIComponent(cleanTitle(g.title))
  const search = await steamJson(`https://store.steampowered.com/api/storesearch/?term=${term}&cc=US&l=en`)
  scanned++

  if (!search || !Array.isArray(search.items) || !search.items.length) {
    missed++
    console.log(`  SKIP ${g.id}: search hit nothing for "${g.title}"`)
    await sleep(1600)
    continue
  }

  const appid = search.items[0].id
  const details = await steamJson(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=US&l=en&filters=basic,movies`,
  )
  await sleep(1600)

  let changed = false
  if (details?.[appid]?.success) {
    const data = details[appid].data
    if (!g.trailer && Array.isArray(data?.movies) && data.movies.length) {
      const url = movieUrl(data.movies[0])
      if (url) {
        g.trailer = url
        changed = true
      }
    }
    if (!(g.appid && g.appid > 0)) {
      g.appid = appid
      changed = true
    }
  }

  if (changed) {
    updated++
    console.log(`  ${g.id}: appid=${g.appid} trailer=${g.trailer ? 'yes' : '—'}`)
  } else {
    missed++
    console.log(`  SKIP ${g.id}: appid=${appid} no usable details`)
  }
}

if (updated > 0) {
  writeFileSync(DATA, JSON.stringify(games, null, 2) + '\n')
  console.log(`saved ${DATA}`)
} else {
  console.log('no changes')
}
console.log(`scanned=${scanned} updated=${updated} missed=${missed}`)