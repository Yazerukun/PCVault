import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'

const HOST = process.env.PCV_CANONICAL || 'https://pcvault.pages.dev'

copyFileSync(new URL('../src/data/games.json', import.meta.url), new URL('../public/games.json', import.meta.url))
console.log('synced games.json -> public/games.json')

const games = JSON.parse(readFileSync(new URL('../src/data/games.json', import.meta.url), 'utf8'))
const now = new Date().toISOString()

const urls = [
  `<url><loc>${HOST}/</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
  ...games.map((g) => `<url><loc>${HOST}/#/game/${encodeURIComponent(g.id)}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
]
writeFileSync(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
)
writeFileSync(
  new URL('../public/robots.txt', import.meta.url),
  `User-agent: *\nAllow: /\nSitemap: ${HOST}/sitemap.xml\n`,
)
console.log(`generated sitemap.xml + robots.txt (${games.length} games)`)