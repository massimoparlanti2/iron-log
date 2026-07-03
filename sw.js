const CACHE_NAME = 'ironlog-v4';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './styles/app.css',
  './src/pwa.js',
  './src/core/constants.js',
  './src/core/metrics.js',
  './src/ui/theme.js',
  './src/components/charts.jsx',
  './src/components/activity.jsx',
  './src/components/workout.jsx',
  './src/components/body.jsx',
  './src/components/navigation.jsx',
  './src/components/week-summary.jsx',
  './src/components/advanced-analysis.jsx',
  './src/components/workout-flow.jsx',
  './src/app.jsx',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(APP_SHELL.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const copy = response.clone();
          if (response.ok || response.type === 'opaque') {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') return caches.match('./index.html');
          return caches.match('./');
        });
    })
  );
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'NOTIFY') return;
  try {
    self.registration.showNotification(event.data.title || 'Iron Log', {
      body: event.data.body || '',
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200]
    });
  } catch (_) {}
});
