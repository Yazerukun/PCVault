import { useCallback, useMemo } from 'react'
import type { Game } from '../data/gameTypes'
import GameCard from './GameCard'

interface Props {
  games: Game[]
  title: string
  favs: string[]
  onToggleFav: (id: string) => void
  sort: string
  onSort: (s: string) => void
  years: number[]
  year: number
  onYear: (y: number) => void
  favOnly: boolean
  onFavOnly: (b: boolean) => void
}

function toGB(size?: string): number {
  if (!size) return 0
  const m = size.match(/([\d.]+)\s*(KB|MB|GB|TB)/i)
  if (!m) return 0
  const n = parseFloat(m[1])
  const u = m[2].toUpperCase()
  return u === 'KB' ? n / 1048576 : u === 'MB' ? n / 1024 : u === 'GB' ? n : u === 'TB' ? n * 1024 : 0
}

export default function GameGrid({ games, title, favs, onToggleFav, sort, onSort, years, year, onYear, favOnly, onFavOnly }: Props) {
  const sorted = useMemo(
    () =>
      [...games].sort((a, b) => {
        if (sort === 'year') return (b.year || 0) - (a.year || 0)
        if (sort === 'oldest') return (a.year || 0) - (b.year || 0)
        if (sort === 'size') return toGB(b.size) - toGB(a.size)
        if (sort === 'az') return a.title.localeCompare(b.title)
        return 0
      }),
    [games, sort],
  )

  const shown = sorted
  const favCount = favs.length

  const toggleFav = useCallback(
    (id: string) => {
      onToggleFav(id)
    },
    [onToggleFav],
  )

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">{favOnly ? 'My Favorites' : title}</h2>
        <div className="section-controls">
          {favOnly && <span className="count-pill">{shown.length} saved</span>}
          {!favOnly && <span className="count-pill">{shown.length} games</span>}
          <button
            type="button"
            className={`fav-toggle${favOnly ? ' active' : ''}`}
            onClick={() => onFavOnly(!favOnly)}
            disabled={favCount === 0 && !favOnly}
            title={favCount ? `${favCount} favorite${favCount === 1 ? '' : 's'}` : 'No favorites yet'}
          >
            &#9825; Favorites{favCount ? ` (${favCount})` : ''}
          </button>
          <select className="sort-select" value={sort} onChange={(e) => onSort(e.target.value)} aria-label="Sort games">
            <option value="default">Featured</option>
            <option value="year">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="size">Size ↓</option>
            <option value="az">A–Z</option>
          </select>
          {years.length > 1 && (
            <select className="sort-select" value={year} onChange={(e) => onYear(Number(e.target.value))} aria-label="Filter by year">
              <option value={0}>All years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {shown.length ? (
        <div className="grid">
          {shown.map((g, idx) => (
            <GameCard key={g.id} game={g} i={idx} fav={favs.includes(g.id)} onToggleFav={toggleFav} />
          ))}
        </div>
      ) : (
        <p className="empty">
          {favOnly ? 'No saved favorites yet. Tap the heart on any game to save it.' : 'No games match this filter.'}
        </p>
      )}
    </section>
  )
}