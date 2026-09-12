const CACHE = 'pcvault-v3'

const DATA_RE = /\/games\.json$|\/health\.json$|\/meta\.json$|\/latest\.json$/

self.addEventListener('install', (e) => {
  const scope = self.registration.scope
  const index = scope.endsWith('/') ? scope : scope + '/'
  const shell = [index, index + 'index.html', index + 'manifest.webmanifest', index + 'games.json', index + 'icons/icon-192.png', index + 'icons/icon-512.png']
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(shell)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return

  const scope = self.registration.scope
  const index = scope.endsWith('/') ? scope : scope + '/'

  // Data files are always network-first so the catalog/health badges update
  // on every deploy even with an active service worker (stale-while-revalidate).
  if (DATA_RE.test(url.pathname)) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          if (resp.ok) {
            const copy = resp.clone()
            caches.open(CACHE).then((c) => c.put(e.request, copy))
          }
          return resp
        })
        .catch(() => caches.match(e.request)),
    )
    return
  }

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(index + 'index.html').then((r) => r || caches.match(index))))
    return
  }

  e.respondWith(
    caches.match(e.request).then(
      (hit) =>
        hit ||
        fetch(e.request).then((resp) => {
          if (e.request.destination === 'image') {
            const copy = resp.clone()
            caches.open(CACHE).then((c) => c.put(e.request, copy))
          }
          return resp
        }),
    ),
  )
})