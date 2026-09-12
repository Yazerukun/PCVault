// Localize cover + wallpaper images: any game whose cover/wallpaper still points
// at an external host (blogger/steam) gets downloaded into public/covers/ and the
// JSON field re-pointed to a local path. Runtime is then fully self-hosted.
//
// Throttled (2 concurrent fetches), resumable (existing files are kept), low
// priority. Screenshots are skipped unless --screens is passed (they're the
// bulk of the bytes).
//
//   node scripts/localize-covers.mjs
//
// Always backs up games.json before rewriting (merge-by-id friendly).
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, createWriteStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const DIR = dirname(fileURLToPath(import.meta.url))
const ROOT = join(DIR, '..')
const DATA = join(ROOT, 'src', 'data', 'games.json')
const COVERS = join(ROOT, 'public', 'covers')
const SCREENS = process.argv.includes('--screens')
const CONCURRENCY = 2

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

mkdirSync(COVERS, { recursive: true })

const games = JSON.parse(readFileSync(DATA, 'utf8'))
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
copyFileSync(DATA, join(ROOT, 'src', 'data', 'games.json.backup-' + stamp + '-covers'))

const isHttp = (u) => typeof u === 'string' && u.startsWith('http')
const safeName = (id, kind) => `${id}-${kind === 'cover' ? 'poster' : 'wide'}.jpg`

async function download(url, dest) {
  if (existsSync(dest) && readFileSync(dest).length > 0) return 'cached'
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok || !res.body) return 'fail'
    await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
    return readFileSync(dest).length > 0 ? 'saved' : 'fail'
  } catch {
    return 'fail'
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  })
  await Promise.all(workers)
  return results
}

const tasks = []
for (const g of games) {
  const cover = g.cover && isHttp(g.cover) ? { game: g, field: 'cover', kind: 'cover' } : null
  const wall = g.wallpaper && isHttp(g.wallpaper) ? { game: g, field: 'wallpaper', kind: 'wide' } : null
  for (const t of [cover, wall]) if (t) tasks.push(t)
  if (SCREENS && Array.isArray(g.screenshots)) {
    g.screenshots.forEach((s, i) => {
      if (isHttp(s)) tasks.push({ game: g, field: null, kind: `shot-${i}` })
    })
  }
}

console.log(`localizing ${tasks.length} images across ${new Set(tasks.map((t) => t.game.id)).size} games (screens: ${SCREENS})`)

let saved = 0
let failed = 0
let cached = 0

await mapLimit(tasks, CONCURRENCY, async (t) => {
  const { game, field, kind } = t
  const dest = join(COVERS, safeName(game.id, kind))
  if (kind.startsWith('shot-')) {
    const i = Number(kind.slice(5))
    const fileName = `${game.id}-shot-${i + 1}.jpg`
    const st = await download(t.game.screenshots[i], join(COVERS, fileName))
    if (st === 'saved') t.game.screenshots[i] = `/covers/${fileName}`
    else if (st === 'fail') failed++
    else cached++
    return
  }
  const st = await download(game[field], dest)
  if (st !== 'fail') {
    const local = `/covers/${safeName(game.id, kind)}`
    if (game[field] !== local) {
      game[field] = local
      saved++
      console.log(`  ${game.id}: ${field} -> covers/${safeName(game.id, kind)} (${st})`)
    } else {
      cached++
    }
  } else failed++
})

if (saved > 0) {
  writeFileSync(DATA, JSON.stringify(games, null, 2) + '\n')
  console.log(`saved ${DATA}`)
} else {
  console.log('no changes')
}
console.log(`saved=${saved} cached=${cached} failed=${failed}`)