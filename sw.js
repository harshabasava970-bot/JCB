// JCB Working - Service Worker v3 (separate Loading module)
const CACHE = 'jcb-working-v3';
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
  '/JCB/js/pages/loading.js',
  '/JCB/js/pages/reports.js',
  '/JCB/js/pages/settings.js',
  '/JCB/js/pages/customer-history.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/JCB/index.html'));
    })
  );
});
