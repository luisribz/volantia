/* Volantia service worker — offline shell (cache name must change on every release) */
const CACHE = "volantia-v20";
const SHELL = ["./", "index.html", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png", "logo-64.png"];
const WORLD = "countries-110m.json";   // ships with the app since v1.10.0
// On a weak connection (airport wifi, roaming) a request can hang for a minute
// before failing. After this long, the saved copy is shown instead and the
// network answer, if it ever comes, only refreshes the cache for next time.
const NET_TIMEOUT = 3500;

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL);
    // precache the world map so the very first offline open still draws it
    // (outside SHELL on purpose: a deploy without this file must still install)
    try { const r = await fetch(WORLD); if (r.ok) await c.put(WORLD, r.clone()); } catch (err) {}
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    // Keep the map and flags from the old cache: they never change, and copying
    // them means an update made online still leaves a fully working offline app.
    const keys = await caches.keys(), next = await caches.open(CACHE);
    for (const k of keys) {
      if (k === CACHE) continue;
      if (k.startsWith("volantia-")) {
        const old = await caches.open(k);
        for (const req of await old.keys()) {
          const h = new URL(req.url).hostname;
          if ((h === "flagcdn.com" || h === "cdn.jsdelivr.net") && !(await next.match(req))) {
            const r = await old.match(req); if (r) await next.put(req, r);
          }
        }
      }
      await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // third-party assets (world map, flags): cache-first, they never change
  if (url.hostname === "cdn.jsdelivr.net" || url.hostname === "flagcdn.com") {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === "opaque") c.put(req, res.clone());
        return res;
      } catch (err) {
        return Response.error();
      }
    })());
    return;
  }

  // never cache the GitHub API (sync must always be live)
  if (url.hostname === "api.github.com" || url.hostname === "gist.githubusercontent.com") return;

  // app shell: network-first so updates land, saved copy when offline or too slow.
  // Stored WITHOUT the query string: the update check fetches "index.html?v=<time>".
  if (url.origin === location.origin) {
    const key = url.origin + url.pathname;
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const fromNet = fetch(req).then(res => {
        if (res.ok) c.put(key, res.clone());
        return res;
      });
      const saved = async () => (await c.match(req, { ignoreSearch: true }))
        || (req.mode === "navigate" ? (await c.match("./")) || (await c.match("index.html")) : null);
      try {
        const res = await Promise.race([fromNet, new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), NET_TIMEOUT))]);
        return res;
      } catch (err) {
        const hit = await saved();
        if (hit) { fromNet.catch(() => {}); return hit; }
        try { return await fromNet; } catch (err2) { return Response.error(); }
      }
    })());
  }
});
