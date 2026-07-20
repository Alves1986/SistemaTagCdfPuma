self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('sistema-tag-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/icon.svg',
        '/logo.svg'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
