const CACHE_NAME = "edu-ai-cache-v2";
const urlsToCache = [
  "./",
  "./home.html",
  "./dashboard.html",
  "./lessons.html",
  "./ai-tutor.html",
  "./accessibility.html",
  "./support.html",
  "./settings.html",
  "./login.html",
  "./register.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./voice.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  const requestUrl = event.request.url;
  const isVideo = event.request.destination === 'video' || requestUrl.endsWith('.mp4');

  if (isVideo) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(response =>
          response || fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
