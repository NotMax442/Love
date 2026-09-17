const CACHE_NAME = 'testforuhs-offline-v1.1.0';
const APP_SHELL = [
    './',
    './index.html',
    './quiz.html',
    './result.html',
    './account.html',
    './about.html',
    './contact.html',
    './privacy.html',
    './terms.html',
    './style.css',
    './shared.js',
    './storage.js',
    './home.js',
    './quiz.js',
    './result.js',
    './account.js',
    './assets/logo.png',
    './assets/khqr.png'
];

const ROUTE_FILES = {
    '/': './index.html',
    '/index': './index.html',
    '/home': './index.html',
    '/account': './account.html',
    '/quiz': './quiz.html',
    '/result': './result.html',
    '/about': './about.html',
    '/contact': './contact.html',
    '/privacy': './privacy.html',
    '/terms': './terms.html'
};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined)
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    const isAppCode = url.pathname.endsWith('.html')
        || url.pathname.endsWith('.js')
        || url.pathname.endsWith('.txt')
        || ROUTE_FILES[url.pathname];

    event.respondWith((isAppCode ? fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => undefined);
        return response;
    }) : caches.match(event.request).then((cached) => cached || fetch(event.request))).catch(() => {
        const fallbackFile = ROUTE_FILES[url.pathname];
        return caches.match(event.request).then((cached) => cached)
            .then((cached) => cached || (fallbackFile ? caches.match(fallbackFile) : caches.match('./index.html')));
    }));
});
