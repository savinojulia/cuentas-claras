// Guarda la app en el celular para que funcione sin internet.
const CACHE = "cuentas-claras-1793297631";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Muestra lo guardado al instante y lo actualiza por detrás cuando hay internet
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(e.request, { ignoreSearch: e.request.mode === "navigate" });
    const net = fetch(e.request).then(res => {
      if (res.ok || res.type === "opaque") cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit || (e.request.mode === "navigate" ? cache.match("index.html") : Response.error()));
    return hit || net;
  }));
});
