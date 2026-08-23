// Service Worker do app "Vendas - Mobile"
// Objetivo principal: permitir que o navegador ofereça "Instalar app".
// Cache mínimo do "shell" (o próprio HTML) para abrir mais rápido e não quebrar sem internet.
// OBS: os dados (vendas, estoque, clientes) continuam vindo do Firebase em tempo real,
// então o app precisa de internet pra funcionar de verdade — isso aqui só evita tela branca.

const CACHE_NAME = "vendas-mobile-v1";
const ASSETS_TO_CACHE = [
  "./index_MOBILE.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Só intercepta pedidos do próprio site (não mexe nas chamadas ao Firebase).
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Atualiza o cache com a versão mais nova sempre que consegue buscar online.
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
