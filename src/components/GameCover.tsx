import { memo, useState } from 'react'
import type { Game } from '../data/gameTypes'

interface Props {
  game: Game
  variant?: 'poster' | 'wide'
  ratio?: string
}

function GameCover({ game, variant = 'poster', ratio }: Props) {
  const [gone, setGone] = useState(false)
  const w = 460
  const h = variant === 'wide' ? 215 : 690
  const [c1, c2] = game.colors ?? ['#232d3a', '#0d1117']

  const src = variant === 'wide' ? game.wallpaper || game.cover : game.cover || game.wallpaper

  if (src && !gone) {
    return (
      <img
        className="cover cover-img"
        style={ratio ? { aspectRatio: ratio, width: '100%', height: '100%' } : undefined}
        src={src}
        alt={`${game.title} cover art`}
        loading="lazy"
        decoding="async"
        onError={() => setGone(true)}
      />
    )
  }

  return (
    <svg
      className="cover"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`${game.title} artwork`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`g-${game.id}-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#g-${game.id}-${variant})`} />
      <g opacity="0.14" stroke="#fff" strokeWidth="1.5" fill="none">
        <circle cx={w * 0.84} cy={h * 0.16} r={h * 0.38} />
        <path d={`M0 ${h * 0.85} L${w * 0.5} ${h * 0.3} L${w} ${h} Z`} />
      </g>
      <foreignObject x="0" y="0" width={w} height={h}>
        <div className="cover-title" style={{ fontSize: variant === 'wide' ? 34 : 20 }}>
          {game.title}
        </div>
      </foreignObject>
    </svg>
  )
}

export default memo(GameCover)