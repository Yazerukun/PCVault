import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CSSProperties } from 'react'
import type { Game } from '../data/gameTypes'
import GameCover from './GameCover'

interface Props {
  game: Game
  fav: boolean
  onToggleFav: (id: string) => void
  i?: number
}

const NEW_DAYS = 60

function GameCard({ game, fav, onToggleFav, i }: Props) {
  const navigate = useNavigate()

  const isNew = useMemo(() => {
    const d = game.date ? Date.parse(game.date) : NaN
    return !Number.isNaN(d) && Date.now() - d < NEW_DAYS * 86400000
  }, [game.date])

  const links = game.mirrors.length + 1

  return (
    <article
      className="game-card"
      style={{ ['--i']: i ?? 0 } as CSSProperties}
      onClick={() => navigate(`/game/${game.id}`)}
    >
      <button
        type="button"
        className={`fav-btn${fav ? ' active' : ''}`}
        aria-label={fav ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
        aria-pressed={fav}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFav(game.id)
        }}
      >
        &#9825;
      </button>
      {isNew && <span className="badge-flag">NEW</span>}
      <div className="card-cover">
        <GameCover game={game} />
        <div className="cover-shade" aria-hidden="true" />
        <div className="card-hover">
          <button
            type="button"
            className="btn-download"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/game/${game.id}`)
            }}
          >
            View Game
          </button>
        </div>
      </div>
      <div className="card-body">
        <h3 className="card-title" title={game.title}>
          {game.title}
        </h3>
        <div className="card-tags">
          {game.genres.slice(0, 2).map((g) => (
            <span key={g} className="tag">
              {g}
            </span>
          ))}
          {game.languages && <span className="tag tag-dlc">{game.languages}</span>}
        </div>
        <div className="card-meta">
          <span className="year-badge">{game.year}</span>
          <span className="card-sub">{game.mirrors[0] ? `via ${game.mirrors[0].label}` : 'direct download'}</span>
        </div>
        <div className="card-footer">
          <span className="size">{game.size ?? '—'}</span>
          <span className="downloads">
            {links} link{links === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </article>
  )
}

export default memo(GameCard)