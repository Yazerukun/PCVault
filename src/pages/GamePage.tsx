import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useGames } from '../data/useGames'
import TrailerEmbed from '../components/TrailerEmbed'
import ScreenshotGallery from '../components/ScreenshotGallery'
import GameCover from '../components/GameCover'
import { useFavorites } from '../hooks/useFavorites'
import { useJson } from '../hooks/useJson'
import type { HealthMap } from '../data/meta'
import type { CSSProperties } from 'react'

function applyMeta(title: string, desc: string, img?: string) {
  document.title = `${title} - PCVault`
  const setMeta = (name: string, content: string) => {
    const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
    if (el) el.setAttribute('content', content)
  }
  setMeta('og:title', title)
  setMeta('og:description', desc)
  if (img) setMeta('og:image', img)
}

export default function GamePage() {
  const { id } = useParams()
  const games = useGames()
  const game = useMemo(() => (games ?? []).find((g) => g.id === id), [games, id])
  const { favs, toggle } = useFavorites()
  const healthAll = useJson<HealthMap>('/health.json')
  const health = healthAll?.[game?.id ?? ''] ?? null
  const [copied, setCopied] = useState<'link' | 'all' | 'pass' | null>(null)
  const [bgGone, setBgGone] = useState(false)

  useEffect(() => {
    if (game) applyMeta(game.title, game.desc.slice(0, 160), game.cover)
    else applyMeta('Not found - PCVault', '')
  }, [game])

  const groups = useMemo(() => {
    if (!game) return []
    const map = new Map<string, Array<{ label: string; url: string }>>()
    for (const m of game.mirrors) {
      const key = m.label || m.url.split('/')[2]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return Array.from(map.entries())
  }, [game])

  if (!game) {
    return (
      <main className="page">
        <Link className="back-link" to="/">&larr; Back to games</Link>
        <p className="empty">Game not found.</p>
      </main>
    )
  }

  const copy = async (text: string, which: 'link' | 'all' | 'pass') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* ignore */
    }
  }

  const allLinks = [game.download, ...game.mirrors.map((m) => m.url)].filter(Boolean)

  const notFound = !game.download && !game.mirrors.length

  return (
    <main className="page">
      <Link className="back-link" to="/">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M19 12H5m0 0 6-6m-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        All games
      </Link>

      <section className="game-hero">
        {game.wallpaper && !bgGone && (
          <img className="game-hero-bg" src={game.wallpaper} alt="" onError={() => setBgGone(true)} />
        )}
        <div
          className="game-hero-glow"
          style={{ backgroundImage: `radial-gradient(120% 90% at 75% 25%, ${game.colors?.[0] ?? '#232d3a'} 0%, transparent 60%), radial-gradient(100% 90% at 15% 100%, ${game.colors?.[1] ?? '#0d1117'} 0%, transparent 55%), linear-gradient(170deg, ${(game.colors?.[0] ?? '#232d3a')}e6 0%, ${(game.colors?.[1] ?? '#0d1117')}f2 100%)` }}
          aria-hidden="true"
        />
        <div className="game-hero-scrim" aria-hidden="true" />

        <div className="game-hero-inner">
          <div className="game-hero-cover">
            <GameCover game={game} />
          </div>

          <div className="game-hero-info">
            <div className="head-row">
              <h1 className="game-page-title">{game.title}</h1>
              <button
                type="button"
                className={`fav-btn big${favs.includes(game.id) ? ' active' : ''}`}
                aria-label="Toggle favorite"
                aria-pressed={favs.includes(game.id)}
                onClick={() => toggle(game.id)}
              >
                &#9825;
              </button>
            </div>

            <div className="modal-tags">
              {game.genres.map((g) => (
                <span key={g} className="tag">{g}</span>
              ))}
              {game.languages && <span className="tag tag-dlc">{game.languages}</span>}
            </div>

            <div className="meta-panel">
              <div className="stat"><span className="stat-label">Release Year</span><span className="stat-value">{game.year || '—'}</span></div>
              {game.size && <div className="stat"><span className="stat-label">Game Size</span><span className="stat-value">{game.size}</span></div>}
              <div className="stat"><span className="stat-label">Genre</span><span className="stat-value">{game.genres[0] ?? '—'}</span></div>
              {game.languages && <div className="stat"><span className="stat-label">Language</span><span className="stat-value">{game.languages}</span></div>}
              <div className="stat"><span className="stat-label">Repack</span><span className="stat-value">{game.repack ?? game.date.slice(0, 10)}</span></div>
            </div>

            {game.desc && <p className="game-desc">{game.desc}</p>}

            <div className="game-hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => document.getElementById('dl')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round" /></svg>
                View Download Links
              </button>
            </div>

            <div className="modal-links" id="dl">
              <div className="dl-primary">
                {game.download ? (
                  <a className="btn-dl-main" href={game.download} target="_blank" rel="noreferrer">
                    <span className="btn-dl-ic">&#11015;</span>
                    <span className="btn-dl-txt">Download</span>
                    {game.size && <span className="btn-dl-size">{game.size}</span>}
                  </a>
                ) : (
                  <span className="btn-dl-main disabled">No live links</span>
                )}
              </div>
              <div className="dl-actions">
                <button type="button" className={`btn-copy${copied === 'link' ? ' copied' : ''}`} onClick={() => copy(game.download, 'link')} disabled={!game.download}>
                  {copied === 'link' ? 'Copied!' : 'Copy link'}
                </button>
                <button type="button" className={`btn-copy${copied === 'all' ? ' copied' : ''}`} onClick={() => copy(allLinks.join('\n'), 'all')} disabled={!allLinks.length}>
                  {copied === 'all' ? 'Copied!' : 'Copy all links'}
                </button>
                <a
                  className="btn-report"
                  href={`https://github.com/FrancisIanMuyco/PCVault/issues/new?title=${encodeURIComponent(`Broken link: ${game.title}`)}&body=${encodeURIComponent(`**Game:** ${game.title}\n**ID:** \`${game.id}\`\n\n**Broken link:**\n\`\`\`\n${game.download}\n\`\`\``)}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open a GitHub issue so the mirror gets re-verified"
                >
                  Report broken link
                </a>
              </div>

              {game.password && (
                <p className="dl-note">
                  Password: <code>{game.password}</code>
                  <button type="button" className="mini-copy" onClick={() => copy(game.password ?? '', 'pass')} aria-label="Copy password">
                    {copied === 'pass' ? 'Copied!' : 'copy'}
                  </button>
                </p>
              )}
              {game.repack && <p className="dl-note">Repack: <code>{game.repack}</code></p>}
            </div>
          </div>
        </div>
      </section>

      {!notFound && (
        <section className="page-section">
          <div className="mirror-head">
            <h2 className="section-title">Mirror Links</h2>
            <div className="mirror-head-right">
              <span className="mirror-head-count">
                {game.mirrors.length} live mirror{game.mirrors.length === 1 ? '' : 's'} &#183; {groups.length} host{groups.length === 1 ? '' : 's'}
              </span>
              {health && (
                <span className="health-badge" title="Links that passed the auto-verification pass">
                  <span className={`health-dot${health.live ? ' ok' : ''}`} />
                  {health.live}/{health.total} verified{health.dead ? ` · ${health.dead} dead` : ''}
                </span>
              )}
            </div>
          </div>
          {groups.map(([host, list]) => (
            <div className="mirror-group" key={host}>
              <div className="mirror-group-label">
                <span className="mirror-host">{host}</span>
                <span className="mirror-host-n">{list.length}</span>
              </div>
              <div className="mirror-list">
                {list.map((m, i) => (
                  <a
                    key={`${m.label}-${m.url}`}
                    className="mirror-row"
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ ['--i']: i } as CSSProperties}
                  >
                    <span className="mirror-row-ic">&#11015;</span>
                    <span className="mirror-row-host">{m.label || host}</span>
                    <span className="mirror-row-url" title={m.url}>{m.url}</span>
                    <span className="mirror-row-open">Open &rarr;</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
          {game.link && (
            <p className="dl-note">
              Source: <a href={game.link} target="_blank" rel="noreferrer">{game.link}</a>
            </p>
          )}
        </section>
      )}

      {(game.history?.length ?? 0) > 0 && (
        <section className="page-section">
          <h2 className="section-title">Repack History</h2>
          <div className="mirror-list">
            <table className="history">
              <thead><tr><th>Version</th><th>Since</th></tr></thead>
              <tbody>
                {game.history?.map((h) => (
                  <tr key={`${h.version}-${h.date}`}><td>{h.version}</td><td>{h.date.slice(0, 10)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <TrailerEmbed game={game} />
      <ScreenshotGallery shots={game.screenshots ?? []} title={game.title} />
    </main>
  )
}