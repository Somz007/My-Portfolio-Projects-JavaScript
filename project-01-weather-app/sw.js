const CACHE = 'weather-app-v1';

// files that make up the app shell — cached on install
const SHELL = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icons/icon.svg',
  './js/app.js',
  './js/api.js',
  './js/cache.js',
  './js/constants.js',
  './js/render.js',
  './js/storage.js',
  './js/utils.js',
];

// pre-cache the app shell so the UI loads offline
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// drop old caches when a new SW takes over
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // network-first for API calls — always want fresh weather data
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('nominatim')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // cache-first for everything else (app shell assets)
  event.respondWith(
    caches.match(request).then(cached => cached ?? fetch(request))
  );
});
