// JCB Working - Service Worker v2 (with Pause/Resume + Loading)
const CACHE = 'jcb-working-v2';
const ASSETS = [
  '/JCB/',
  '/JCB/index.html',
  '/JCB/css/style.css',
  '/JCB/js/app.js',
  '/JCB/js/db.js',
  '/JCB/js/pdf.js',
  '/JCB/js/share.js',
  '/JCB/js/pages/login.js',
  '/JCB/js/pages/home.js',
  '/JCB/js/pages/start-work.js',
  '/JCB/js/pages/running.js',
  '/JCB/js/pages/end-work.js',
  '/JCB/js/pages/history.js',
  '/JCB/js/pages/detail.js',
  '/JCB/js/pages/reports.js',
  '/JCB/js/pages/settings.js',
  '/JCB/js/pages/customer-history.js',
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/JCB/index.html'));
    })
  );
});
