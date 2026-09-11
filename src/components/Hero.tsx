import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Game } from '../data/gameTypes'

interface Props {
  game: Game
  onFav?: (id: string) => void
  fav?: boolean
}

export default function Hero({ game, onFav, fav }: Props) {
  const navigate = useNavigate()
  const [bgGone, setBgGone] = useState(false)
  const [coverGone, setCoverGone] = useState(false)

  const bgWall = game.wallpaper || ''
  const coverSrc = game.cover || game.wallpaper || ''
  const [c1, c2] = game.colors ?? ['#232d3a', '#0d1117']
  const links = game.mirrors.length + 1

  return (
    <section
      className="hero"
      onClick={() => navigate(`/game/${game.id}`)}
      role="link"
      tabIndex={0}
      aria-label={game.title}
      onKeyDown={(e) => {
        if (e.key === 'Enter') navigate(`/game/${game.id}`)
      }}
    >
      {bgWall && !bgGone && (
        <img className="hero-bg" src={bgWall} alt="" onError={() => setBgGone(true)} />
      )}
      <div
        className="hero-glow"
        style={{ backgroundImage: `radial-gradient(120% 90% at 70% 30%, ${c1} 0%, transparent 60%), radial-gradient(100% 90% at 20% 90%, ${c2} 0%, transparent 55%), linear-gradient(160deg, ${c1}e6 0%, ${c2}f2 100%)` }}
        aria-hidden="true"
      />
      <div className="hero-shade" aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-info">
          <span className="hero-eyebrow">Featured Game</span>
          <h1 className="hero-title">{game.title}</h1>
          <div className="hero-meta">
            <span className="year-badge year-badge-lg">{game.year || '—'}</span>
            <span className="rating-label">
              {links} mirror link{links === 1 ? '' : 's'}
            </span>
            {game.size && <span className="rating-label">{game.size}</span>}
          </div>
          {game.desc && <p className="hero-desc">{game.desc}</p>}
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/game/${game.id}`)
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M8 12h8m0 0-3-3m3 3-3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              View Game
            </button>
            {onFav && (
              <button
                type="button"
                className={`btn btn-ghost${fav ? ' active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onFav(game.id)
                }}
                aria-pressed={!!fav}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={fav ? '#ff5f7a' : 'none'} stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 20s-7-4.6-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.4-9.2 9-9.2 9Z" strokeLinejoin="round" /></svg>
                {fav ? 'Favorited' : 'Favorite'}
              </button>
            )}
          </div>
        </div>

        {coverSrc && !coverGone && (
          <div className="hero-cover-wrap">
            <img src={coverSrc} alt={`${game.title} cover art`} onError={() => setCoverGone(true)} />
          </div>
        )}
      </div>
    </section>
  )
}