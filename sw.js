const CACHE_PREFIX = 'testforuhs-offline';
const CACHE_VERSION = 'v1.2.0';
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;

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
    './new-dashboard.css',
    './design-bootstrap.js',
    './shared.js',
    './storage.js',
    './home.js',
    './quiz.js',
    './result.js',
    './account.js',
    './translations.js',
    './about.js',
    './contact.js',
    './manifest.webmanifest',
    './assets/logo.png',
    './assets/khqr.png',
    './assets/lucide.js',
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

const DATA_PATH_PATTERNS = [
    /\/data\//i,
    /\.json$/i,
    /\.txt$/i
];

function isSameOriginRequest(request) {
    const url = new URL(request.url);
    return url.origin === self.location.origin;
}

function isRouteRequest(url) {
    return Boolean(ROUTE_FILES[url.pathname]);
}

function isDataRequest(url) {
    return DATA_PATH_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isHtmlRequest(url) {
    return url.pathname.endsWith('.html') || isRouteRequest(url);
}

function isAppAsset(url) {
    return /\.(js|css|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|map)$/i.test(url.pathname);
}

async function cacheResponse(request, response) {
    if (!response || response.status !== 200 || response.type === 'opaque') return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
}

async function getFallbackResponse(url) {
    const fallbackFile = ROUTE_FILES[url.pathname] || './index.html';
    const fallbackResponse = await caches.match(fallbackFile);
    if (fallbackResponse) return fallbackResponse;

    const appShellResponse = await caches.match('./index.html');
    return appShellResponse || Response.error();
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .catch(() => undefined)
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!isSameOriginRequest(event.request)) return;

    const url = new URL(event.request.url);

    event.respondWith((async () => {
        if (event.request.mode === 'navigate' || isHtmlRequest(url)) {
            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse && networkResponse.ok) {
                    await cacheResponse(event.request, networkResponse);
                }
                return networkResponse;
            } catch (error) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;
                return getFallbackResponse(url);
            }
        }

        if (isDataRequest(url)) {
            const cachedResponse = await caches.match(event.request);
            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse && networkResponse.ok) {
                    await cacheResponse(event.request, networkResponse);
                    return networkResponse;
                }
            } catch (error) {
                // Ignore network error and fall back to cache.
            }
            return cachedResponse || getFallbackResponse(url);
        }

        if (isAppAsset(url) || url.pathname.includes('/assets/')) {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) return cachedResponse;

            try {
                const networkResponse = await fetch(event.request);
                if (networkResponse && networkResponse.ok) {
                    await cacheResponse(event.request, networkResponse);
                    return networkResponse;
                }
            } catch (error) {
                // Ignore download issues and return the app fallback.
            }

            return getFallbackResponse(url);
        }

        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        try {
            const networkResponse = await fetch(event.request);
            if (networkResponse && networkResponse.ok) {
                await cacheResponse(event.request, networkResponse);
                return networkResponse;
            }
        } catch (error) {
            // Fall back to the home page when a non-critical asset is unavailable.
        }

        return getFallbackResponse(url);
    })());
});
