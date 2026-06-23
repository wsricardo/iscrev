const CACHE = "iscrev-notes-v10.12"
const ASSETS = [
    "./", "./diario.html", "./assets/css/diario.css", "./assets/css/style.css",
    "./assets/js/diario.js", "./assets/js/site-nav.js", "./assets/js/ui.js",
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
    // Ignora requisições que não são GET
    if (e.request.method !== 'GET') {
        return;
    }

    e.respondWith(
        caches.open(CACHE).then(cache => {
            return cache.match(e.request).then(response => {
                // Stale-While-Revalidate: busca na rede em paralelo para atualizar o cache
                const fetchPromise = fetch(e.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(e.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Ignora falhas de rede para não quebrar a aplicação offline
                    return null;
                });
                // Retorna a resposta do cache se disponível, senão, aguarda a rede.
                return response || fetchPromise;
            });
        })
    );
});
