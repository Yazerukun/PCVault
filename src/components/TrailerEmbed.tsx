import type { Game } from '../data/gameTypes'

export default function TrailerEmbed({ game }: { game: Game }) {
  if (!game.trailer) return null
  return (
    <section className="page-section">
      <h2 className="section-title">Gameplay Trailer</h2>
      <div className="trailer">
        <video controls preload="none" poster={game.wallpaper || game.cover}>
          <source src={game.trailer} type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      </div>
    </section>
  )
}