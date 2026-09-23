const C = "labchart-5b091755b4";
const SHELL = ["./","./index.html","./manifest.webmanifest",
  "./icons/icon-192.png","./icons/icon-512.png","./icons/icon-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
/* network-first for same-origin GET: online users always get the latest build,
   offline users fall back to the cached copy. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) return;            // Gemini etc. go straight to network
  e.respondWith(
    fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(C).then(c => c.put(req, copy));
      return resp;
    }).catch(() =>
      caches.match(req).then(hit => hit || caches.match("./index.html"))
    )
  );
});
