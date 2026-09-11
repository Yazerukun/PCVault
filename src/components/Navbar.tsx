import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGames } from '../data/useGames'
import type { Game } from '../data/gameTypes'

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg className="nav-logo-icon" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3 27 8.5v6.2c0 6.4-4.4 11.6-11 14.3C9.4 26.3 5 21.1 5 14.7V8.5L16 3Z"
        stroke="url(#pvgrad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="rgba(67,198,244,0.08)"
      />
      <path d="M16 11.5v7M11.5 15h9" stroke="#43C6F4" strokeWidth="2.2" strokeLinecap="round" />
      <defs>
        <linearGradient id="pvgrad" x1="5" y1="4" x2="27" y2="29">
          <stop stopColor="#43C6F4" />
          <stop offset="1" stopColor="#8C68FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface Props {
  games: number
  onQuery: (q: string) => void
  favs: string[]
  favOnly: boolean
  onFavOnly: (b: boolean) => void
  searchOpen: boolean
  onSearchOpen: (b: boolean) => void
}

export default function Navbar({
  games: total,
  onQuery,
  favs,
  favOnly,
  onFavOnly,
  searchOpen,
  onSearchOpen,
}: Props) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const catalog = useGames() ?? []
  const games: Game[] = catalog

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return games.slice(0, 6)
    return games
      .filter((g) => g.title.toLowerCase().includes(t) || g.genres.some((x) => x.toLowerCase().includes(t)))
      .slice(0, 8)
  }, [q, games])

  useEffect(() => setCursor(0), [q, searchOpen])

  useEffect(() => {
    if (searchOpen) {
      setQ('')
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onSearchOpen(!searchOpen)
      }
      if (e.key === 'Escape') onSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, onSearchOpen])

  const pick = (title?: string) => {
    if (title) onQuery(title)
    onSearchOpen(false)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link className="nav-brand" to="/" aria-label="PCVault home">
            <LogoMark />
            <span className="nav-brand-word">
              PC<em>VAULT</em>
            </span>
          </Link>

          <div className="nav-links">
            <button type="button" className="nav-link active" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M3 12 12 4l9 8M5 10v10h5v-6h4v6h5V10" strokeLinejoin="round" /></svg>
              Discover
            </button>
            <button type="button" className="nav-link" onClick={() => scrollTo('latest')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
              Latest
            </button>
            <button type="button" className="nav-link" onClick={() => scrollTo('genres')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M4 6h6l2 3h8v11H4z" strokeLinejoin="round" /></svg>
              Genres
            </button>
          </div>

          <button type="button" className="search-box" onClick={() => onSearchOpen(true)} aria-label="Search games">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
            <span>Search games, genres...</span>
            <span className="kbd">Ctrl K</span>
          </button>

          <div className="nav-actions">
            <button
              type="button"
              className={`nav-fav-btn${favOnly ? ' active' : ''}`}
              onClick={() => {
                onFavOnly(!favOnly)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              aria-label="Show favorite games"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={favOnly ? '#ff5f7a' : 'none'} stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 20s-7-4.6-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.4-9.2 9-9.2 9Z" strokeLinejoin="round" /></svg>
              Favorites
              {favs.length > 0 && <span className="nav-fav-count">{favs.length}</span>}
            </button>
            <span className="nav-count">{total} games</span>
            <button type="button" className="mobile-toggle" onClick={() => onSearchOpen(true)} aria-label="Open search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div
          className="search-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) onSearchOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search games"
        >
          <div className="search-panel">
            <div className="search-input-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
              <input
                ref={inputRef}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search games, genres..."
                aria-label="Search games"
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setCursor((c) => Math.min(c + 1, results.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setCursor((c) => Math.max(c - 1, 0))
                  } else if (e.key === 'Enter' && results[cursor]) {
                    pick(results[cursor].title)
                  }
                }}
              />
              <span className="kbd">ESC</span>
            </div>
            <div className="search-results">
              {results.length === 0 && (
                <div className="search-empty">No games match “{q}”.</div>
              )}
              {results.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  className="search-item"
                  style={{ background: i === cursor ? 'var(--card)' : undefined }}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => pick(g.title)}
                >
                  {g.cover ? (
                    <img className="search-item-img" src={g.cover} alt="" loading="lazy" />
                  ) : (
                    <span className="search-item-img" />
                  )}
                  <span className="search-item-body">
                    <span className="search-item-title">{g.title}</span>
                    <span className="search-item-meta">
                      {(g.genres[0] ?? 'Game') + (g.year ? ` • ${g.year}` : '')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button type="button" className="search-all" onClick={() => pick(q || undefined)}>
              View all results
            </button>
          </div>
        </div>
      )}
    </>
  )
}