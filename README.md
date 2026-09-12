# PCVault

A clean, cinematic library of PC game repack downloads (focused on gamepciso),
hosted as a zero-backend SPA on GitHub Pages + Cloudflare Pages.

## Stack

- React 19 + TypeScript + Vite (no UI library; hand-rolled dark theme)
- `HashRouter` + relative base → deployable to any static host unchanged
- Service worker (`public/sw.js`): offline shell, cache-safe data files
  (`games.json`/`health.json`/`meta.json`/`latest.json` are always network-first)
- Catalog at runtime from `public/games.json` (bundled fallback included)

## Data pipeline (in `/home/ian/Projects/hunter-toolbox`)

- `python3 -m hunter.gp_focus <slug>...` — pull new games from gamepciso into
  `src/data/games.json` (written as a full HUD-history session)
- `python3 -m hunter.gp_verify` — probe every mirror (GET source-of-truth on
  filecrypt), drop dead links, re-point `download`, push `health.json` +
  `meta.json`; also emitted per-game `public/health.json` (live/dead/total) that
  the site renders as verification badges
- Nightly/weekly: `~/.config/systemd/user/pcvault-verify.timer` runs the verify
  at Sat 03:00 (idle I/O priority). `systemctl --user disable pcvault-verify.timer`
  to opt out.

## Maintenance scripts (node, safe/resumable)

- `node scripts/enrich-metadata.mjs [--cap N]` — Steam Storefront API lookup for
  missing `appid` + gameplay trailer (`movie_max.mp4`, un-keyed). Throttled 1.6s.
- `node scripts/localize-covers.mjs [--screens]` — download external covers /
  wallpapers into `public/covers/` and re-point fields to local paths
  (2 concurrent). All scripts back up `games.json` as `*.backup-<ts>-<step>` first;
  rewrites preserve array order (merge-by-id safe).
- `scripts/sync-public.mjs` (runs on `npm run build`) — copy `games.json` to
  `public/` and regenerate `robots.txt` + `sitemap.xml`. Canonical host can be
  overridden with `PCV_CANONICAL`.

## Deploy

- GitHub Pages: `.github/workflows/deploy.yml` (auto on push to `main`)
- Cloudflare Pages: `.github/workflows/cloudflare.yml` (needs repo secrets
  `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`)
- Manual Cloudflare: `wrangler pages deploy dist --project-name pcvault`

## Build / checks

```bash
npm run lint     # oxlint
npm run build    # tsc -b && scripts/sync-public.mjs && vite build
```