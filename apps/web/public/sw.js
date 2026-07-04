const CACHE_NAME = "rpeak-shell-v2";
const STATIC_URLS = ["/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// No se cachean documentos, RSC, API ni chunks de Next. Mezclar HTML nuevo con
// JavaScript antiguo provoca fallos de hidratación tras cada despliegue.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !STATIC_URLS.includes(url.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request)),
  );
});
