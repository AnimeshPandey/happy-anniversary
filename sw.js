var CACHE = 'anniversary-v4';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './themes.js',
  './content.js',
  './theme-controller.js',
  './manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        var clone = resp.clone();
        caches.open(CACHE).then(function (cache) { cache.put(e.request, clone); });
        return resp;
      });
    })
  );
});
