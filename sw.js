// Service Worker: macht die Web-App installierbar und zeigt die Seite
// auch kurz ohne Internet an. Daten (Firebase) werden NICHT zwischengespeichert,
// damit immer der aktuelle Schichtplan angezeigt wird.
// Bei jeder App-Änderung CACHE erhöhen (siehe auch APP_VERSION in index.html und version.json).
const CACHE = 'schichtplanung-v12';
const FILES = ['./', './index.html', './manifest.json?v=3',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Nur eigene Dateien behandeln, alles andere (Firebase, Tailwind) normal laden
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // Erst Internet versuchen (immer neueste Version), sonst gespeicherte Kopie.
  // cache: 'no-cache' = beim Server nachfragen, ob es eine neuere Datei gibt
  // (sonst könnte der Browser bis zu 10 Minuten eine alte Kopie benutzen).
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
