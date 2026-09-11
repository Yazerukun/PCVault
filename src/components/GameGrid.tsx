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
  favOnly: boolean
  onFavOnly: (b: boolean) => void
}

export default function GameGrid({ games, title, favs, onToggleFav, sort, onSort, favOnly, onFavOnly }: Props) {
  const sorted = useMemo(
    () =>
      [...games].sort((a, b) => {
        if (sort === 'year') return (b.year || 0) - (a.year || 0)
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
            <option value="az">A–Z</option>
          </select>
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