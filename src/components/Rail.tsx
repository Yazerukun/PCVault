import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '../data/gameTypes'
import GameCover from './GameCover'

interface Props {
  games: Game[]
  limit?: number
}

export default function Rail({ games, limit = 12 }: Props) {
  const recent = useMemo(
    () =>
      [...games]
        .filter((g) => {
          const d = g.added || g.date
          return d && !Number.isNaN(Date.parse(d))
        })
        .sort((a, b) => {
          const da = Date.parse(a.added || a.date)
          const db = Date.parse(b.added || b.date)
          return db - da
        })
        .slice(0, limit),
    [games, limit],
  )

  if (!recent.length) return null

  return (
    <section className="page-section" id="latest">
      <div className="section-head">
        <h2 className="section-title">Recently Added</h2>
        <span className="count-pill">{recent.length} fresh repacks</span>
      </div>
      <div className="rail-wrap">
        <div className="rail">
          {recent.map((g) => (
            <Link key={g.id} className="rail-card" to={`/game/${g.id}`}>
              <div className="rail-cover">
                <GameCover game={g} />
                <div className="rail-shade" aria-hidden="true" />
              </div>
              <div className="rail-body">
                <span className="rail-title">{g.title}</span>
                <span className="rail-meta">
                  {g.year || '—'} {g.size ? `• ${g.size}` : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}