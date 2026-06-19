const CACHE = "viaje-polonia-v3";

// ✅ Instalación: guarda los archivos iniciales
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => {
            return cache.addAll([
                "/",
                "/index.html",

                // CSS
                "/css/styles.css",
                "/css/navbar.css",
                "/css/info.css",
                "/css/maps.css",
                "/css/finances.css",
                "/css/suitcase.css",

                // JS
                "/js/app.js",

                // ICONOS
                "/icons/icon-192.png",
                "/icons/icon-512.png"
            ]);
        })
    );
});

// ✅ Activación (limpia versiones antiguas)
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// ✅ Fetch inteligente (offline + auto-guardado)
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {

            // ✅ si está en cache → úsalo
            if (response) {
                return response;
            }

            // ✅ si no → fetch + guardado automático
            return fetch(event.request).then(fetchRes => {
                return caches.open(CACHE).then(cache => {
                    cache.put(event.request, fetchRes.clone());
                    return fetchRes;
                });
            }).catch(() => {
                // opcional: fallback offline
                return new Response("Sin conexión 😢");
            });

        })
    );
});