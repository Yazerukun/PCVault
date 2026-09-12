import { useEffect, useMemo, useState } from 'react'
import { allGenres } from '../data/games'
import { useGames } from '../data/useGames'
import Navbar, { LogoMark } from '../components/Navbar'
import Hero from '../components/Hero'
import GameGrid from '../components/GameGrid'
import Rail from '../components/Rail'
import LatestFeed from '../components/LatestFeed'
import CheckedBadge from '../components/CheckedBadge'
import CategoryBrowse from '../components/CategoryBrowse'
import { useFavorites } from '../hooks/useFavorites'

export default function Home() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('All')
  const [year, setYear] = useState(0)
  const [sort, setSort] = useState('default')
  const [favOnly, setFavOnly] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const { favs, toggle } = useFavorites()
  const games = useGames()

  useEffect(() => {
    const onScroll = () => {
      const t = window.scrollY < 80
      if (t !== atTop) setAtTop(t)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [atTop])

  const genres = useMemo(() => (games ? allGenres(games) : []), [games])

  const years = useMemo(() => {
    const set = new Set<number>()
    for (const g of games ?? []) if (g.year) set.add(g.year)
    return Array.from(set).sort((a, b) => b - a)
  }, [games])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const g of games ?? []) for (const x of new Set(g.genres)) map[x] = (map[x] || 0) + 1
    return map
  }, [games])

  const featured = useMemo(() => (games ?? []).find((g) => g.cover) ?? (games ?? [])[0], [games])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (games ?? []).filter((g) => {
      const matchQ = !q || g.title.toLowerCase().includes(q) || g.genres.some((x) => x.toLowerCase().includes(q))
      const matchG = genre === 'All' || g.genres.includes(genre)
      const matchY = !year || g.year === year
      const matchFav = !favOnly || favs.includes(g.id)
      return matchQ && matchG && matchY && matchFav
    })
  }, [query, genre, year, favOnly, favs, games])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  if (games === null) {
    return (
      <>
        <Navbar games={0} onQuery={setQuery} favs={favs} favOnly={favOnly} onFavOnly={setFavOnly} searchOpen={searchOpen} onSearchOpen={setSearchOpen} />
        <main>
          <div className="badge-row"><CheckedBadge /></div>
          <section className="section"><div className="grid"><span className="empty">Loading catalog…</span></div></section>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar
        games={filtered.length}
        onQuery={setQuery}
        favs={favs}
        favOnly={favOnly}
        onFavOnly={(b) => {
          setFavOnly(b)
          scrollTop()
        }}
        searchOpen={searchOpen}
        onSearchOpen={setSearchOpen}
      />
      <main>
        <div className="badge-row">
          <CheckedBadge />
        </div>

        {!query && genre === 'All' && !favOnly && featured && (
          <Hero game={featured} onFav={toggle} fav={favs.includes(featured?.id ?? '')} />
        )}

        {!query && !favOnly && (
          <section id="genres">
            <CategoryBrowse genres={genres} counts={counts} total={games.length} active={genre} onSelect={setGenre} />
          </section>
        )}

        {!query && genre === 'All' && !favOnly && <Rail games={games} />}

        <section id="explore">
          <GameGrid
            games={filtered}
            title={genre === 'All' ? 'Explore PC Games' : genre}
            favs={favs}
            onToggleFav={toggle}
            sort={sort}
            onSort={setSort}
            years={years}
            year={year}
            onYear={setYear}
            favOnly={favOnly}
            onFavOnly={(b) => {
              setFavOnly(b)
              scrollTop()
            }}
          />
        </section>

        {!query && genre === 'All' && !favOnly && <LatestFeed />}

        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-top">
              <div>
                <div className="footer-brand">
                  <LogoMark size={26} />
                  <span className="nav-brand-word">
                    PC<em>VAULT</em>
                  </span>
                </div>
                <p className="footer-tag">A clean, cinematic library of repack downloads. Discover PC games through organized cover art, trailers and verified links.</p>
              </div>
              <nav className="footer-links" aria-label="Footer">
                <button type="button" onClick={scrollTop}>Discover</button>
                <button type="button" onClick={() => scrollTo('latest')}>Latest</button>
                <button type="button" onClick={() => scrollTo('genres')}>Genres</button>
                <button type="button" onClick={() => {
                  setFavOnly(true)
                  scrollTop()
                }}>Favorites</button>
                <button type="button" onClick={() => scrollTo('explore')}>Browse All</button>
              </nav>
            </div>
            <div className="footer-bottom">
              PCVault &#183; Fan-made library &#183; Links auto-verified on every scan &#183; Not affiliated with any publisher
            </div>
          </div>
        </footer>
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        <button type="button" className={`bottom-nav-btn${atTop && !favOnly ? ' active' : ''}`} onClick={scrollTop}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12 12 4l9 8M5 10v10h5v-6h4v6h5V10" strokeLinejoin="round" /></svg>
          <span>Home</span>
          <span className="dot" />
        </button>
        <button type="button" className={`bottom-nav-btn${!atTop && !favOnly ? ' active' : ''}`} onClick={() => scrollTo('explore')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
          <span>Browse</span>
          <span className="dot" />
        </button>
        <button type="button" className="bottom-nav-btn" onClick={() => setSearchOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" /></svg>
          <span>Search</span>
          <span className="dot" />
        </button>
        <button
          type="button"
          className={`bottom-nav-btn${favOnly ? ' active' : ''}`}
          onClick={() => {
            setFavOnly(!favOnly)
            scrollTop()
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={favOnly ? '#ff5f7a' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20s-7-4.6-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.4-9.2 9-9.2 9Z" strokeLinejoin="round" /></svg>
          <span>Favorites</span>
          <span className="dot" />
        </button>
      </nav>
    </>
  )
}