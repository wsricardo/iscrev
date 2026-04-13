const CACHE = "iscrev-notes-v8"
const ASSETS = [
    "./", "./diario.html", "./assets/css/diario.css", "./assets/css/style.css",
    "./assets/js/diario.js", "./assets/js/pdf-exporter.js", "./assets/js/site-nav.js", "./assets/js/ui.js",
    "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
    "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Dancing+Script:wght@600&family=JetBrains+Mono:wght@400;500&display=swap"
]

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => {
            return cache.addAll(ASSETS).then(() => self.skipWaiting())
        })
    );
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
