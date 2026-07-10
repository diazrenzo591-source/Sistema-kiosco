// service-worker.js
// Guarda la app en la memoria del celular para que abra aunque no haya
// internet en ese momento. Los datos (clientes, ventas, stock) se guardan
// aparte, en localStorage, no ac\u00e1 - esto solo cachea los archivos de la app.

const CACHE_NAME = 'kiosco-plus-v5';
const ARCHIVOS_A_GUARDAR = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
];

// Al instalar el service worker, descarga y guarda los archivos base.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_A_GUARDAR))
  );
  self.skipWaiting();
});

// Al activarse, borra versiones viejas del cache si actualizaste la app.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: primero intenta la red (para traer cosas actualizadas si hay
// internet), y si no hay conexi\u00f3n, usa lo que ya guard\u00f3 en cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((respuestaRed) => {
        const copia = respuestaRed.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return respuestaRed;
      })
      .catch(() => caches.match(event.request))
  );
});
