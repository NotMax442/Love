const CACHE_NAME = 'testforuhs-offline-v1.2.0';
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
    './assets/khqr.png',
    './data/manifest.json'
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

function cacheResponse(request, response) {
    if (!response || !response.ok) return;
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => undefined);
}

function appCodeFallback(request, pathname) {
    const fallbackFile = ROUTE_FILES[pathname];
    return caches.match(request)
        .then((cached) => cached || (fallbackFile ? caches.match(fallbackFile) : caches.match('./index.html')));
}

function staleWhileRevalidate(request, pathname) {
    return caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
            cacheResponse(request, response);
            return response;
        });

        if (cached) {
            network.catch(() => undefined);
            return cached;
        }

        return network.catch(() => appCodeFallback(request, pathname));
    });
}

function cacheFirstWithUpdate(request) {
    return caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        cacheResponse(request, response);
        return response;
    }));
}

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    const isAppCode = url.pathname.endsWith('.html')
        || url.pathname.endsWith('.js')
        || url.pathname.endsWith('.txt')
        || ROUTE_FILES[url.pathname];

    const isQuestionData = url.pathname.includes('/data/')
        && url.pathname.endsWith('.json')
        && !url.pathname.endsWith('/manifest.json');

    if (isAppCode) {
        event.respondWith(staleWhileRevalidate(event.request, url.pathname));
        return;
    }

    if (isQuestionData) {
        event.respondWith(cacheFirstWithUpdate(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cached) => cached || fetch(event.request))
            .catch(() => caches.match(event.request))
    );
});
